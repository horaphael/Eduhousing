import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eduhousing-test-uploads-'));
process.env.UPLOAD_DIR = tmpDir;

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
