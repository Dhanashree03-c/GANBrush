import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric"; 
import { 
  Pencil, Eraser, Trash2, Sparkles, Download, 
  RefreshCw, Settings, Image as ImageIcon, ChevronDown,
  Square, Circle, Triangle as TriangleIcon,
  Sun, Moon
} from "lucide-react";

// Themes
const BACKGROUND_DARK = "https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop";
const BACKGROUND_LIGHT = "https://img.freepik.com/free-vector/white-gray-geometric-pattern-background-vector_53876-136510.jpg";

const STYLES = ["Realistic", "Anime", "Cyberpunk", "Watercolor", "Oil Paint"];

export default function App() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // States
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tool, setTool] = useState("pencil");
  const [brushSize] = useState(5);
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- CANVAS INIT ---
  useEffect(() => {
    if (fabricCanvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#ffffff", 
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = "#27272a";

    fabricCanvasRef.current = canvas;

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.setDimensions({ width, height });
        canvas.renderAll();
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(containerRef.current);
    resizeCanvas(); 

    return () => {
      observer.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [brushSize]);

  // --- TOOL UPDATES ---
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.freeDrawingBrush.width = brushSize;

    if (tool === "pencil") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "#27272a";
    } else if (tool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "#ffffff";
      canvas.freeDrawingBrush.width = brushSize * 5;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [tool, brushSize]);

  // --- SHAPES ---
  const addShape = (shapeType) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setTool('select');
    
    const common = { left: canvas.width/2, top: canvas.height/2, originX: 'center', originY: 'center', fill: 'transparent', stroke: '#27272a', strokeWidth: 3 };
    let shape;

    if (shapeType === 'square') shape = new fabric.Rect({ ...common, width: 80, height: 80 });
    if (shapeType === 'circle') shape = new fabric.Circle({ ...common, radius: 40 });
    if (shapeType === 'triangle') shape = new fabric.Triangle({ ...common, width: 80, height: 80 });

    if(shape) { canvas.add(shape); canvas.setActiveObject(shape); }
  };

  // --- EXPORT SKETCH ---
  const exportSketch = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    if (canvas.getObjects().length === 0){
      return null;
    }

    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();

    return canvas.toDataURL({
      format: "png",
      quality: 1.0
    });
  };

  // --- GENERATE ---
  const handleGenerate = async () => {
  try {
    setIsGenerating(true);

    const sketchBase64 = exportSketch();

    if (!sketchBase64) {
      alert("Please draw something!");
      setIsGenerating(false);
      return;
    }

    const finalPrompt = 
      prompt?.trim().length > 0
        ? `${prompt}, ${selectedStyle} style, ultra detailed, realistic lighting`
        : `${selectedStyle} style, ultra detailed, realistic lighting`;

    // Call your backend API
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: finalPrompt,
        image: sketchBase64
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    if (!data.image) {
      throw new Error("Backend did not return an image");
    }

    setGeneratedImage(data.image);
  } catch (error) {
    console.error("Generation error:", error);
    alert("Generation failed. Check backend logs.");
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className={`${isDarkMode ? 'dark' : 'light'} h-screen w-full transition-colors duration-500`}>
      <div 
        className="h-full w-full bg-cover bg-center overflow-hidden flex flex-col text-gray-800 dark:text-white transition-all duration-500"
        style={{ backgroundImage: `url('${isDarkMode ? BACKGROUND_DARK : BACKGROUND_LIGHT}')` }}
      >
        <div className="absolute inset-0 bg-white/40 dark:bg-[#050314]/50 backdrop-blur-[1px] pointer-events-none transition-colors duration-500"></div>

        {/* --- HEADER --- */}
        <header className="relative z-10 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg text-white">
              <Sparkles size={20}/>
            </div>
            <h1 className="text-xl font-bold tracking-tight drop-shadow-sm">GANBrush</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-all">
              {isDarkMode ? <Sun size={20} className="text-yellow-300"/> : <Moon size={20} className="text-indigo-600"/>}
            </button>

            <div className="hidden md:flex gap-2 p-1 app-panel !rounded-full !bg-black/5 dark:!bg-black/40">
              {STYLES.slice(0, 3).map(s => (
                <button key={s} onClick={()=>setSelectedStyle(s)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedStyle === s ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'}`}>
                  {s}
                </button>
              ))}
              <button className="px-2 text-gray-400"><ChevronDown size={16}/></button>
            </div>
          </div>
        </header>

        {/* --- MAIN WORKSPACE --- */}
        <main className="relative z-10 flex-1 flex gap-4 p-4 pt-2 overflow-auto items-stretch justify-center">
          
          {/* 1. TOOLS (Left) */}
          <aside className="w-16 md:w-20 flex-shrink-0 app-panel flex flex-col items-center py-6 gap-5">
            <ToolBtn icon={<Pencil size={20}/>} active={tool==='pencil'} onClick={()=>setTool('pencil')}/>
            <ToolBtn icon={<Eraser size={20}/>} active={tool==='eraser'} onClick={()=>setTool('eraser')}/>
            <div className="h-px w-8 bg-gray-300 dark:bg-white/10 my-1"></div>
            <ToolBtn icon={<Square size={20}/>} onClick={()=>addShape('square')}/>
            <ToolBtn icon={<Circle size={20}/>} onClick={()=>addShape('circle')}/>
            <ToolBtn icon={<TriangleIcon size={20}/>} onClick={()=>addShape('triangle')}/>
            <div className="mt-auto">
              <ToolBtn icon={<Trash2 size={20} className="text-red-500 dark:text-red-400"/>} onClick={()=>fabricCanvasRef.current?.clear()}/>
            </div>
          </aside>

          {/* 2. CANVAS (Center) */}
          <section className="flex-1 flex flex-col justify-center items-center gap-4 min-w-0">
            <div className="w-full max-w-[700px] h-[min(80vh,700px)] app-panel p-3 relative group shadow-2xl flex-shrink-0">
              <div ref={containerRef} className="w-full h-full rounded-2xl bg-white overflow-hidden relative cursor-crosshair border border-gray-100 dark:border-none shadow-inner">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {/* PROMPT BAR */}
            <div className="w-full max-w-[700px] h-16 app-panel flex items-center px-4 gap-3 !rounded-full flex-shrink-0">
              <input 
                type="text" 
                placeholder="Describe your sketch..."
                value={prompt}
                onChange={(e)=>setPrompt(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400 dark:text-white"
              />
              <button onClick={handleGenerate} disabled={isGenerating} className="primary-btn">
                {isGenerating ? <RefreshCw size={16} className="animate-spin"/> : <Sparkles size={16}/>}
                Generate
              </button>
            </div>
          </section>

          {/* 3. RESULT (Right) */}
          <aside className="w-[400px] lg:w-[450px] xl:w-[500px] flex-shrink-0 app-panel p-6 flex flex-col gap-4 overflow-auto">
            <div className="flex justify-between items-center text-sm font-semibold opacity-70">
              <h3>Generated Result</h3>
              <Settings size={18} className="cursor-pointer hover:opacity-100"/>
            </div>

            <div className="w-full aspect-portrait rounded-2xl overflow-hidden relative group bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-inner">
              {generatedImage ? (
                <>
                  <img src={generatedImage} className="w-full h-full object-cover" alt="AI Art" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button className="p-4 bg-white rounded-full hover:scale-110 transition shadow-lg"><Download size={24} className="text-black"/></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <ImageIcon size={64}/>
                  <span className="text-xs uppercase font-bold tracking-wider">No Result Yet</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <button className="py-4 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold transition flex items-center justify-center gap-2">
                <Download size={16}/> Save
              </button>
              <button onClick={handleGenerate} disabled={isGenerating} className="primary-btn justify-center">
                <RefreshCw size={16} className={isGenerating?"animate-spin":""}/> Re-Generate
              </button>
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
}

function ToolBtn({ icon, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>
      {icon}
    </button>
  )
}
