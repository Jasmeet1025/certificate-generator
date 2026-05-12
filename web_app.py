import streamlit as st
import pandas as pd
import os
import shutil
import subprocess
import re
from datetime import datetime
from docxtpl import DocxTemplate
from PyPDF2 import PdfMerger
import io

# ================= CONFIG =================
# On Linux (Google Cloud), the command is usually just 'soffice'
# For local Windows testing, you might still need the full path
# Updated logic for both Windows and Google Cloud
if os.name == 'nt': # If running on Windows
    LIBRE_OFFICE = r"C:\Program Files\LibreOffice\program\soffice.exe"
else: # If running on Google Cloud (Linux)
    LIBRE_OFFICE = "soffice" 

st.set_page_config(page_title="Certificate Generator Pro", layout="wide")

# ================= UI =================
st.title("📜 Certificate Generator Pro")
st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    uploaded_excel = st.file_uploader("1. Upload Data Excel Sheet", type=["xlsx"])
with col2:
    uploaded_template = st.file_uploader("2. Upload Word Template", type=["docx"])

if uploaded_excel and uploaded_template:
    # Load Data
    df = pd.read_excel(uploaded_excel)
    st.write("### Data Preview", df.head())

    # Selection Mode
    mode = st.radio("Choose Processing Mode:", ["Row Range", "Place Filter"])
    
    selected_data = pd.DataFrame()

    if mode == "Row Range":
        c1, c2 = st.columns(2)
        start_row = c1.number_input("Start Row", min_value=2, max_value=len(df)+1, value=2)
        end_row = c2.number_input("End Row", min_value=2, max_value=len(df)+1, value=len(df)+1)
        # Slicing (Excel Row 2 is index 0)
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
            
            # Setup Temp Folder
            temp_dir = "temp_gen"
            if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
            os.makedirs(temp_dir)

            docx_files = []
            
            # 1. Generate DOCX
            for i, (idx, row) in enumerate(selected_data.iterrows()):
                excel_row_num = idx + 2
                
                # Column Map: A=ID, B=Name, C=Place, E=Date
                cert_id = str(row.iloc[0])
                name = str(row.iloc[1])
                place_val = str(row.iloc[2])
                raw_date = row.iloc[4]
                
                clean_date = raw_date.strftime('%d/%m/%Y') if isinstance(raw_date, (datetime, pd.Timestamp)) else str(raw_date)
                
                # Render Template
                doc = DocxTemplate(uploaded_template)
                doc.render({"NAME": name, "CERTNO": cert_id, "PLACE": place_val, "DATE": clean_date})
                
                # Safe Filename
                safe_name = re.sub(r'[\\/]', '-', name)
                fname = f"{excel_row_num}, {safe_name}.docx"
                fpath = os.path.join(temp_dir, fname)
                
                doc.save(fpath)
                docx_files.append(fpath)
                
                progress_bar.progress((i + 1) / (len(selected_data) * 2))
                status_text.text(f"Generating Word Files: {i+1}/{len(selected_data)}")

            # 2. Convert to PDF (LibreOffice)
            status_text.text("Converting to PDF... (This requires LibreOffice installed)")
            try:
                # Passing all files at once to LibreOffice
                subprocess.run([LIBRE_OFFICE, "--headless", "--convert-to", "pdf", "--outdir", temp_dir] + docx_files, check=True)
                
                # 3. Merge PDFs
                merger = PdfMerger()
                pdf_files = [f.replace(".docx", ".pdf") for f in docx_files]
                
                for pdf in pdf_files:
                    if os.path.exists(pdf):
                        merger.append(pdf)
                
                # Final Output
                output_pdf = "Final_Certificates.pdf"
                merger.write(output_pdf)
                merger.close()
                
                progress_bar.progress(1.0)
                status_text.success("All Done!")
                
                # Provide Download Link
                with open(output_pdf, "rb") as f:
                    st.download_button(
                        label="⬇️ Download Merged PDF",
                        data=f,
                        file_name="Certificates_Bundle.pdf",
                        mime="application/pdf"
                    )
                    
            except Exception as e:
                st.error(f"Error during PDF conversion: {e}")
                st.info("Note: Ensure LibreOffice is installed and added to your System PATH.")