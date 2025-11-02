import pytesseract as pt
from PIL import Image
import layoutparser as lp
import fitz
from docx import Document
import os

pt.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
ocr_agent = lp.TesseractAgent(languages="eng")

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    # Images
    if ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff"]:
        image = Image.open(file_path)
        return ocr_agent.detect(image)

    #PDFs
    elif ext == ".pdf":
        text = ""
        with fitz.open(file_path) as doc:
            for page in doc:
                page_text = page.get_text("text")
                if not page_text.strip():  # fallback to OCR if empty
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    page_text = ocr_agent.detect(img)
                text += page_text + "\n"
        return text.strip()
    #Documents word
    elif ext == ".docx":
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    #Fichiers txt
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    else:
        raise ValueError(f"Unsupported file format: {ext}")