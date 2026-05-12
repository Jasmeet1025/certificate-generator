import streamlit as st
import pandas as pd
import os
import shutil
import subprocess
import re
from datetime import datetime
from docxtpl import DocxTemplate
from PyPDF2 import PdfMerger

# ================= 1. THE FONT SURGERY (CRITICAL) =================
def force_install_fonts():
    if os.name != 'nt':
        # Paths where Linux/LibreOffice look for fonts
        target_dirs = [
            os.path.expanduser("~/.fonts"),
            os.path.expanduser("~/.local/share/fonts"),
            "/home/appuser/.fonts" # Streamlit specific path
        ]
        
        # Exact name of your file in GitHub
        source_font = "amsterdam.ttf" 
        
        if os.path.exists(source_font):
            for d in target_dirs:
                if not os.path.exists(d):
                    os.makedirs(d)
                shutil.copy(source_font, os.path.join(d, "amsterdam.ttf"))
            
            # Rebuild cache
            subprocess.run(["fc-cache", "-f", "-v"], check=True)
            return "Font copied to all target dirs."
        return "amsterdam.ttf NOT FOUND in root!"

font_status = force_install_fonts()

# ================= 2. CONFIG =================
if os.name == 'nt':
    LIBRE_OFFICE = r"C:\Program Files\LibreOffice\program\soffice.exe"
else:
    LIBRE_OFFICE = "soffice"

st.set_page_config(page_title="Certificate Generator Pro", layout="wide")

# ================= 3. UI =================
st.title("📜 Certificate Generator Pro")
st.sidebar.write(f"**Font Setup Status:** {font_status}")

uploaded_excel = st.file_uploader("1. Upload Data Excel Sheet", type=["xlsx"])
uploaded_template = st.file_uploader("2. Upload Word Template", type=["docx"])

if uploaded_excel and uploaded_template:
    df = pd.read_excel(uploaded_excel)
    st.write("### Data Preview", df.head())

    mode = st.radio("Choose Processing Mode:", ["Row Range", "Place Filter"])
    selected_data = pd.DataFrame()

    if mode == "Row Range":
        c1, c2 = st.columns(2)
        start_row = c1.number_input("Start Row", min_value=2, max_value=len(df)+1, value=2)
        end_row = c2.number_input("End Row", min_value=2, max_value=len(df)+1, value=len(df)+1)
        selected_data = df.iloc[start_row-2 : end_row-1]
    else:
        places = df.iloc[:, 2].dropna().unique()
        target_place = st.selectbox("Select Place", places)
        selected_data = df[df.iloc[:, 2].astype(str).str.strip() == target_place]

    if st.button("🚀 GENERATE CERTIFICATES"):
        if selected_data.empty:
            st.error("No data selected!")
        else:
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            temp_dir = "temp_gen"
            if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
            os.makedirs(temp_dir)

            docx_files = []
            
            # 1. Generate DOCX
            for i, (idx, row) in enumerate(selected_data.iterrows()):
                excel_row_num = idx + 2
                cert_id, name, place_val = str(row.iloc[0]), str(row.iloc[1]).strip(), str(row.iloc[2])
                raw_date = row.iloc[4]
                clean_date = raw_date.strftime('%d/%m/%Y') if isinstance(raw_date, (datetime, pd.Timestamp)) else str(raw_date)
                
                doc = DocxTemplate(uploaded_template)
                doc.render({"NAME": name, "CERTNO": cert_id, "PLACE": place_val, "DATE": clean_date})
                
                safe_name = re.sub(r'[\\/]', '-', name)
                fname = f"{excel_row_num}_{safe_name}.docx"
                fpath = os.path.join(temp_dir, fname)
                doc.save(fpath)
                docx_files.append(fpath)
                
                progress_bar.progress((i + 1) / (len(selected_data) * 2))
                status_text.text(f"Word Files: {i+1}/{len(selected_data)}")

            # 2. Convert to PDF
            status_text.text("Converting to PDF...")
            try:
                # We add the environment variable here just in case
                my_env = os.environ.copy()
                # Run LibreOffice
                subprocess.run([LIBRE_OFFICE, "--headless", "--convert-to", "pdf", "--outdir", temp_dir] + docx_files, 
                               check=True, env=my_env)
                
                # 3. Merge
                merger = PdfMerger()
                for doc_path in docx_files:
                    pdf_path = doc_path.replace(".docx", ".pdf")
                    if os.path.exists(pdf_path):
                        merger.append(pdf_path)
                
                output_pdf = "Final_Certificates.pdf"
                merger.write(output_pdf)
                merger.close()
                
                st.success("Success!")
                with open(output_pdf, "rb") as f:
                    st.download_button("⬇️ Download Merged PDF", f, "Certificates.pdf", "application/pdf")
                    
            except Exception as e:
                st.error(f"PDF Error: {e}")
