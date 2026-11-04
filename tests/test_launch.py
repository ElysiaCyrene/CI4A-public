import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('ci4a_run', Path(__file__).resolve().parents[1] / 'Eous/run.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)

class TaskUrlTests(unittest.TestCase):
    def test_original_protocol_less_local_url(self):
        self.assertEqual(runner.rebase_task_url('http://127.0.0.1:5274', 'localhost:5173'), 'http://127.0.0.1:5274/')

    def test_preserve_route_query_and_fragment(self):
        self.assertEqual(runner.rebase_task_url('http://127.0.0.1:5275/', 'http://webarenax.com/reports?year=2022#sales'), 'http://127.0.0.1:5275/reports?year=2022#sales')

    def test_relative_route(self):
        self.assertEqual(runner.rebase_task_url('http://127.0.0.1:5273', '/reports'), 'http://127.0.0.1:5273/reports')

    def test_empty_route(self):
        self.assertEqual(runner.rebase_task_url('http://127.0.0.1:5273', ''), 'http://127.0.0.1:5273/')

if __name__ == '__main__':
    unittest.main()
