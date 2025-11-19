import zipfile
import rarfile
import pathlib
import tqdm
import py7zr


root = pathlib.Path("./subtitle-backup/")


def extract_archive(path: pathlib.Path) -> None:
    destination = path.parent
    suffix = path.suffix.lower()

    if suffix == ".zip":
        with zipfile.ZipFile(path) as archive:
            archive.extractall(destination)
    elif suffix == ".rar":
        with rarfile.RarFile(path) as archive:
            archive.extractall(destination)
    elif suffix == ".7z":
        with py7zr.SevenZipFile(path) as archive:
            archive.extractall(destination)
    else:
        raise ValueError(f"Unsupported archive type: {path}")
    
    path.unlink()


if __name__ == "__main__":
    files = list(root.glob("**/*"))
    archives = [file for file in files if file.is_file() and file.suffix.lower() in [".zip", ".rar", ".7z"]]

    for archive in tqdm.tqdm(archives, desc="Extracting archives"):
        try:
            extract_archive(archive)
        except Exception as exc:
            print(f"Failed to extract {archive}: {exc}")