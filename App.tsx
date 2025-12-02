import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  Upload, 
  Download, 
  ChevronRight, 
  Terminal, 
  Eraser,
  Zap
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { Button } from './components/Button';
import { enhanceUserPrompt, generateImageFromPrompt, editImageWithPrompt } from './services/geminiService';
import { EnhancedPrompt, AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Generation State
  const [enhancedPrompt, setEnhancedPrompt] = useState<EnhancedPrompt | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Editing State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animations
  const [showJson, setShowJson] = useState(false);

  // Handlers
  const handleEnhanceAndGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setIsEnhancing(true);
    setEnhancedPrompt(null);
    setGeneratedImage(null);
    setShowJson(true);

    try {
      // Step 1: Text -> JSON
      const enhanced = await enhanceUserPrompt(inputText);
      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);

      // Step 2: JSON -> Image
      const imageUrl = await generateImageFromPrompt(enhanced);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setIsEnhancing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!sourceImage || !inputText.trim()) return;

    setIsLoading(true);
    setGeneratedImage(null); // Clear previous result to show loading state effectively

    try {
      const imageUrl = await editImageWithPrompt(sourceImage, inputText);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to edit image. The model may have rejected the request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setGeneratedImage(null); // Reset generated on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `neon-genesis-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                NeonGenesis
              </h1>
              <p className="text-xs text-gray-500 font-mono tracking-wider">POWERED BY GEMINI NANO BANANA</p>
            </div>
          </div>
          
          <nav className="flex p-1 bg-gray-900/80 border border-white/10 rounded-xl backdrop-blur-md">
            <button
              onClick={() => { setMode(AppMode.GENERATE); setInputText(''); setGeneratedImage(null); setEnhancedPrompt(null); }}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === AppMode.GENERATE ? 'bg-cyan-900/30 text-cyan-400 shadow-inner shadow-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Create
            </button>
            <button
              onClick={() => { setMode(AppMode.EDIT); setInputText(''); setGeneratedImage(null); }}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === AppMode.EDIT ? 'bg-cyan-900/30 text-cyan-400 shadow-inner shadow-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          </nav>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <GlassCard className="p-6 h-full flex flex-col">
              
              <div className="flex items-center gap-2 mb-6 text-cyan-400">
                {mode === AppMode.GENERATE ? <Zap className="w-5 h-5" /> : <Eraser className="w-5 h-5" />}
                <h2 className="text-lg font-semibold tracking-wide">
                  {mode === AppMode.GENERATE ? 'Prompt Engineering' : 'Image Manipulation'}
                </h2>
              </div>

              {mode === AppMode.EDIT && (
                <div className="mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative group cursor-pointer h-48 rounded-xl border-2 border-dashed transition-all overflow-hidden
                      ${sourceImage ? 'border-cyan-500/30' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'}
                    `}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    
                    {sourceImage ? (
                      <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-gray-300">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Click to upload source image</span>
                      </div>
                    )}

                    {sourceImage && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Change Image</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {mode === AppMode.GENERATE ? 'Describe your vision' : 'Instructions (e.g., "Make it cyberpunk")'}
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === AppMode.GENERATE 
                      ? "A futuristic city with flying cars and neon lights in the rain..." 
                      : "Add sunglasses to the cat..."}
                    className="w-full h-32 bg-gray-950/50 border border-gray-800 rounded-xl p-4 text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                  />
                </div>

                {/* Prompt Enhancement Visualization (Only in Generate Mode) */}
                {mode === AppMode.GENERATE && showJson && (
                  <div className={`mt-4 overflow-hidden transition-all duration-500 ${isEnhancing ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs">
                      <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-gray-800 pb-2">
                        <Terminal className="w-3 h-3" />
                        <span>JSON_PROMPT_CONVERTER</span>
                      </div>
                      {isEnhancing ? (
                        <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                          Processing natural language...
                        </div>
                      ) : enhancedPrompt ? (
                        <div className="text-gray-300 space-y-1">
                          <div className="text-cyan-400">{"{"}</div>
                          {Object.entries(enhancedPrompt).map(([key, value]) => (
                            <div key={key} className="pl-4">
                              <span className="text-blue-400">"{key}"</span>: <span className="text-green-400">"{value?.toString().slice(0, 50)}..."</span>,
                            </div>
                          ))}
                          <div className="text-cyan-400">{"}"}</div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button 
                  onClick={mode === AppMode.GENERATE ? handleEnhanceAndGenerate : handleEditImage}
                  isLoading={isLoading}
                  className="w-full"
                  disabled={!inputText || (mode === AppMode.EDIT && !sourceImage)}
                >
                  {isLoading ? 'Processing...' : mode === AppMode.GENERATE ? 'Convert to JSON & Generate' : 'Apply Edit'}
                </Button>
              </div>
            </GlassCard>
          </section>

          {/* Right Panel: Output */}
          <section className="lg:col-span-7 h-full min-h-[500px]">
            <GlassCard className="h-full flex flex-col relative group">
              
              {generatedImage ? (
                <div className="relative w-full h-full flex flex-col">
                  {/* Image Display */}
                  <div className="flex-1 relative overflow-hidden bg-black/40">
                    <img 
                      src={generatedImage} 
                      alt="Generated result" 
                      className="w-full h-full object-contain animate-in fade-in zoom-in duration-500" 
                    />
                  </div>
                  
                  {/* Action Bar */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="secondary" onClick={handleDownload} className="!px-3 !py-2 !rounded-lg bg-black/50 backdrop-blur-md border-white/20">
                        <Download className="w-5 h-5 text-white" />
                     </Button>
                  </div>

                  {/* Enhanced Prompt Details Panel (Bottom overlay) */}
                  {enhancedPrompt && mode === AppMode.GENERATE && (
                     <div className="bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 text-sm text-gray-300 max-h-[30%] overflow-y-auto">
                        <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                           <Sparkles className="w-3 h-3" /> Enhanced Prompt Used
                        </h3>
                        <p className="leading-relaxed opacity-80">{enhancedPrompt.detailed_description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                           <span className="bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-xs">{enhancedPrompt.artistic_style}</span>
                           <span className="bg-blue-900/40 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-xs">{enhancedPrompt.mood}</span>
                        </div>
                     </div>
                  )}
                </div>
              ) : (
                /* Empty State / Placeholder */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  <div className="w-24 h-24 mb-6 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent animate-pulse" />
                     {mode === AppMode.GENERATE ? (
                       <Sparkles className="w-10 h-10 text-gray-700" />
                     ) : (
                       <ImageIcon className="w-10 h-10 text-gray-700" />
                     )}
                  </div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    {isLoading ? 'Dreaming...' : 'Ready to Create'}
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    {isLoading 
                      ? "The AI is constructing your visual data..." 
                      : mode === AppMode.GENERATE 
                        ? "Enter a prompt to start the text-to-JSON-to-Image pipeline." 
                        : "Upload an image and tell the AI how to change it."}
                  </p>
                </div>
              )}
            </GlassCard>
          </section>

        </main>
      </div>
    </div>
  );
};

export default App;
