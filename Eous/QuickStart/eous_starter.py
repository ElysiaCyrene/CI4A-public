"""Compatibility entry point; use Eous/run.py for all new runs."""
from pathlib import Path
import runpy
import sys
if __name__ == '__main__':
    sys.argv[1:] = ['--task-id' if arg == '--task_id' else arg for arg in sys.argv[1:]]
    if '--target' not in sys.argv:
        sys.argv.extend(['--target', 'webarena'])
    if '--task-id' not in sys.argv and '--instruction' not in sys.argv and '--probe' not in sys.argv:
        sys.argv.extend(['--task-id', '0'])
    runpy.run_path(str(Path(__file__).resolve().parents[1] / 'run.py'), run_name='__main__')
