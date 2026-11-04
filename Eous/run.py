"""Portable Eous entry point. --probe never calls a model or scores a benchmark."""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'Eous'))

def rebase_task_url(base_url, original_url):
    if original_url and '://' not in original_url and not original_url.startswith('/'):
        original_url = 'http://' + original_url
    original = urlsplit(original_url)
    return base_url.rstrip('/') + (original.path or '/') + (f'?{original.query}' if original.query else '') + (f'#{original.fragment}' if original.fragment else '')

def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--library', choices=['antdx', 'materialx', 'elementx'], default='antdx')
    p.add_argument('--target', choices=['components', 'webarena'], default='components')
    p.add_argument('--url', help='Override the selected local environment URL')
    task = p.add_mutually_exclusive_group()
    task.add_argument('--task-id', help='WebArena example ID: 0, 1, 11, 107, or 108')
    task.add_argument('--instruction')
    p.add_argument('--mode', choices=['vision', 'structure'], default='vision')
    p.add_argument('--ablation', choices=['status', 'tool', 'metadata', 'all'])
    p.add_argument('--headless', action='store_true')
    p.add_argument('--probe', action='store_true', help='Verify browser, CI4A, and Eous perception without LLM calls')
    p.add_argument('--timeout', type=int, default=600, help='Total wall-clock timeout in seconds')
    return p

async def run(args):
    from dotenv import load_dotenv
    from playwright.async_api import async_playwright
    from Eous.config.eous_config import EousConfig
    from Eous.config.model_config import CoreChatModelConfig
    from loguru import logger
    load_dotenv(ROOT / '.env')
    index = ['antdx', 'materialx', 'elementx'].index(args.library)
    port = int(os.getenv('COMPONENT_PORT', '5283') if args.target == 'components' else os.getenv('WEBARENA_PORT', '5273'))
    base_url = args.url or f'http://127.0.0.1:{port + index}'
    instruction = args.instruction
    url = base_url
    if args.task_id:
        if args.target != 'webarena':
            raise ValueError('--task-id requires --target webarena')
        if not args.task_id.isdigit():
            raise ValueError('Task ID must be an integer')
        task_path = ROOT / 'tasks' / args.target / f'{args.task_id}.json'
        if not task_path.is_file():
            raise ValueError('Bundled WebArena examples: 0, 1, 11, 107, 108')
        task = json.loads(task_path.read_text(encoding='utf-8-sig'))
        instruction = task['intent']
        url = rebase_task_url(base_url, task.get('start_url', ''))
    if not args.probe and not instruction:
        raise ValueError('Select a bundled WebArena --task-id with --target webarena, or supply --instruction.')
    if not args.probe and not (os.getenv('EOUS_API_KEY') or os.getenv('OPENAI_API_KEY')):
        raise ValueError('Set EOUS_API_KEY in .env before running Eous, or use --probe for a no-model check.')

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=args.headless)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        client = None
        try:
            await page.goto(url, wait_until='networkidle', timeout=60000)
            await page.wait_for_function('window.__ci4a__ && window.__ci4a__.exportSchema().length > 0', timeout=20000)
            config_model = None
            if not args.probe:
                temp = os.getenv('EOUS_TEMPERATURE', '').strip()
                config_model = CoreChatModelConfig(
                    model_name=os.getenv('EOUS_MODEL', 'gpt-5'),
                    model_temperature=float(temp) if temp else None,
                    model_info={'vision': True, 'function_calling': True, 'json_output': True},
                    api_base=os.getenv('EOUS_API_BASE', 'https://api.openai.com/v1'),
                    api_key=os.getenv('EOUS_API_KEY') or os.getenv('OPENAI_API_KEY'),
                    timeout=float(os.getenv('EOUS_TIMEOUT', '120')),
                )
            task_prefix = args.library
            config = EousConfig(task_name=f'{task_prefix}_{args.task_id or "demo"}',
                                temp_path=str(ROOT / 'runs'), model=config_model, page=page,
                                visual_mode=args.mode == 'vision', ablation_mode=args.ablation)
            client = config.model_client
            logger.remove()
            logger.add(sys.stderr, level='INFO')
            logger.add(str(Path(config.task_temp_path) / 'run.log'), level='DEBUG')
            report = {'library': args.library, 'target': args.target, 'url': url,
                      'task_id': args.task_id, 'instruction': instruction, 'mode': args.mode,
                      'ablation': args.ablation, 'probe_only': args.probe, 'benchmark_evaluated': False}
            if args.probe:
                from Eous.tools.page_perceptor.psip.tool import mark_page
                marks = await mark_page(args.mode == 'vision', page)
                report['registered_components'] = await page.evaluate('window.__ci4a__.exportSchema().length')
                report['perceived_marks'] = len(marks)
                report['perceived_components'] = sum(bool(m.get('isComponent')) for m in marks)
                if report['perceived_components'] == 0:
                    raise RuntimeError('CI4A exists but Eous perception found no components')
                await page.screenshot(path=str(Path(config.task_temp_path) / 'probe.png'))
            else:
                from EousTester.quickstart import EousTester
                await asyncio.wait_for(EousTester(config).test(instruction, url), timeout=args.timeout)
                report['runtime_finished'] = True
                report['note'] = 'Runtime termination is not a benchmark success judgment. Use the original task evaluator.'
            report_path = Path(config.task_temp_path) / 'result.json'
            report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
            print(json.dumps(report, ensure_ascii=False, indent=2))
            print(f'Artifacts: {report_path}')
        finally:
            if client is not None and hasattr(client, '_client'):
                await client._client.close()
            await context.close()
            await browser.close()

if __name__ == '__main__':
    try:
        asyncio.run(run(parser().parse_args()))
    except (Exception, KeyboardInterrupt) as exc:
        print(f'Eous failed: {exc}', file=sys.stderr)
        sys.exit(1)
