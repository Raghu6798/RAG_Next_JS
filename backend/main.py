import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from langchain.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv
import warnings
import tempfile


warnings.filterwarnings('ignore')
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize embeddings
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': True}
embeddings = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

# Initialize Groq's model
Deepseek = ChatGroq(
    model="deepseek-r1-distill-llama-70b",
    temperature=0.8,
    max_tokens=2048,
    max_retries=2,
    api_key=os.getenv("GROQ_API_KEY")
)

# Global variable to store the vector store
vectorstore = None

# Define prompt template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """
        You are an expert document analyst with the ability to process large volumes of text efficiently. 
        Your task is to extract key insights and answer questions based on the content of the provided document: {context}
        When asked a question, you should provide a direct, detailed, and concise response, only using the information available from the document. 
        If the answer cannot be found directly, you should clarify this and provide relevant context or related information if applicable.
        Focus on uncovering critical information, whether it's specific facts, summaries, or hidden insights within the document.
    """),
    ("human", "{question}")
])


@app.get("/")
def greet():
    return {'greet':'Hey what is up , welcome to my server'}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vectorstore
    if file.filename.split(".")[-1].lower() != "pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    try:
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        vectorstore = FAISS.from_documents(chunks, embeddings)
        
        return {"message": "PDF uploaded and processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    finally:
        os.unlink(temp_file_path)

@app.get("/chat/{message}")
async def chat(message: str):
    global vectorstore
    if not vectorstore:
        raise HTTPException(status_code=400, detail="Please upload a PDF first")

    try:
        docs = vectorstore.similarity_search(message, k=3)
        context = "\n".join([doc.page_content for doc in docs])
        
        prompt = prompt_template.format(context=context, question=message)
        response = await Deepseek.ainvoke(prompt)
        
        return {"response": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
