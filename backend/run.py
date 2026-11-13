import os
import sys
from pathlib import Path

# Auto-switch to virtual environment python if available
CURRENT_DIR = Path(__file__).resolve().parent
venv_python = CURRENT_DIR / "venv" / "bin" / "python"
if venv_python.exists() and sys.executable != str(venv_python):
    os.execv(str(venv_python), [str(venv_python)] + sys.argv)

if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir=str(CURRENT_DIR))
