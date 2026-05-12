import streamlit as st
import pandas as pd
import os
import shutil
import subprocess
import re
from datetime import datetime
from docxtpl import DocxTemplate
from PyPDF2 import PdfMerger

# ================= 1. SILENT FONT SETUP =================
def initialize_fonts():
    """Runs silently in the background to ensure Amsterdam font is available."""
    if os.name != 'nt':
        font_dir = os.path.expanduser("~/.local/share/fonts")
        source_font = "amsterdam.ttf"
        if os.path.exists(source_font):
            if not os.path.exists(font_dir):
                os.makedirs(font_dir)
            shutil.copy(source_font, os.path.join(font_dir, source_font))
            subprocess.run(["fc-cache", "-f"], check=False)

initialize_fonts()

# ================= 2. CONFIG =================
LIBRE_OFFICE = r"C:\Program Files\LibreOffice\program\soffice.exe" if os.name == 'nt' else "soffice"

st.set_page_config(page_title="Certificate Generator Pro", layout="wide")

# ================= 3. UI =================
st.title("📜 Certificate Generator Pro")
st.markdown("---")

col1, col2 = st.columns(2)
with col1:
    uploaded_excel = st.file_uploader("1. Upload Data Excel Sheet", type=["xlsx"])
with col2:
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
            # Fixed Progress Bar Logic
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            temp_dir = "temp_gen"
            if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
            os.makedirs(temp_dir)

            docx_files = []
            total_rows = len(selected_data)
            
            # --- PHASE 1: WORD GENERATION (0% to 50%) ---
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
                
                # Progress goes from 0 to 0.5
                progress_bar.progress(int(((i + 1) / total_rows) * 50))
                status_text.text(f"Creating Word Documents: {i+1}/{total_rows}")

            # --- PHASE 2: PDF CONVERSION (50% to 90%) ---
            status_text.text("Converting all files to PDF... Please wait.")
            progress_bar.progress(60) 
            
            try:
                subprocess.run([LIBRE_OFFICE, "--headless", "--convert-to", "pdf", "--outdir", temp_dir] + docx_files, check=True)
                progress_bar.progress(85)
                
                # --- PHASE 3: MERGING (90% to 100%) ---
                status_text.text("Merging into final PDF...")
                merger = PdfMerger()
                for doc_path in docx_files:
                    pdf_path = doc_path.replace(".docx", ".pdf")
                    if os.path.exists(pdf_path):
                        merger.append(pdf_path)
                
                output_pdf = "Final_Certificates.pdf"
                merger.write(output_pdf)
                merger.close()
                
                progress_bar.progress(100)
                status_text.success("Generation Complete!")
                
                with open(output_pdf, "rb") as f:
                    st.download_button(
                        label="⬇️ Download Merged PDF",
                        data=f,
                        file_name="Certificates_Bundle.pdf",
                        mime="application/pdf"
                    )
            except Exception as e:
                st.error(f"Error during PDF processing: {e}")
