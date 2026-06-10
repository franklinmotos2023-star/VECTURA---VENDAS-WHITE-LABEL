import React, { useState, useRef } from 'react';
import { Acessorio } from '../types';
import { Camera, X, Save, ArrowLeft, Wand2, Loader2, Tag, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAcessoriosConfig } from '../hooks/useAcessoriosConfig';
import { ChevronDown } from 'lucide-react';

interface AcessorioFormProps {
  acessorio?: Acessorio | null;
  onSave: (acessorio: Omit<Acessorio, 'id'>) => void;
  onCancel: () => void;
}

import { X as XIcon } from 'lucide-react'; // ensure X is there

function MultiSelectDropdown({ options, value, onChange, placeholder }: { options: string[], value: string | string[], onChange: (val: string[]) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentValues = Array.isArray(value) ? value : (value ? [value] : []);

  const toggle = (opt: string) => {
    if (currentValues.includes(opt)) {
      onChange(currentValues.filter(v => v !== opt));
    } else {
      onChange([...currentValues, opt]);
    }
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-purple-600 outline-none transition-all cursor-pointer flex flex-wrap gap-2 items-center"
      >
        {currentValues.length === 0 && <span className="text-zinc-500 font-bold">{placeholder}</span>}
        {currentValues.map(v => (
          <span key={v} onClick={(e) => { e.stopPropagation(); toggle(v); }} className="bg-purple-600/20 text-purple-400 px-2 py-1 flex items-center gap-1 rounded-md text-xs font-bold transition-colors hover:bg-purple-600/40">
            {v} <XIcon size={12} />
          </span>
        ))}
      </div>
      {isOpen && (
        <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentValues.includes(opt)}
                onChange={() => toggle(opt)}
                className="rounded border-zinc-700 bg-zinc-950 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-white text-sm font-medium">{opt}</span>
            </label>
          ))}
          {options.length === 0 && <p className="text-zinc-500 text-sm text-center py-2">Sem opções disponíveis</p>}
        </div>
      )}
      {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

function TagsInput({ value, onChange, placeholder }: { value: string | string[], onChange: (val: string[]) => void, placeholder: string }) {
  const [inputValue, setInputValue] = useState('');
  const tags = Array.isArray(value) ? value : (value ? value.split(',').map(s=>s.trim()).filter(Boolean) : []);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="w-full min-h-[48px] px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-purple-600 outline-none transition-all flex flex-wrap gap-2 items-center">
      {tags.map(t => (
        <span key={t} className="bg-purple-600/20 text-purple-400 px-2 py-1 flex items-center gap-1 rounded-md text-xs font-bold transition-colors hover:bg-purple-600/40 cursor-pointer" onClick={() => removeTag(t)}>
          {t} <XIcon size={12} />
        </span>
      ))}
      <input 
        type="text" 
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue.trim());
          }
        }}
        onBlur={() => addTag(inputValue.trim())}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-white text-sm"
      />
    </div>
  );
}

export default function AcessorioForm({ acessorio, onSave, onCancel }: AcessorioFormProps) {
  const config = useAcessoriosConfig();

  const [formData, setFormData] = useState<Omit<Acessorio, 'id'>>({
    nome: acessorio?.nome || '',
    descricao: acessorio?.descricao || '',
    preco: acessorio?.preco || 0,
    precoPromocional: acessorio?.precoPromocional || 0,
    emPromocao: acessorio?.emPromocao || false,
    fotos: acessorio?.fotos || [],
    aplicacao: acessorio?.aplicacao || '',
    marcaMoto: acessorio?.marcaMoto || '',
    modeloMoto: acessorio?.modeloMoto || '',
    estoque: acessorio?.estoque || 1,
    categoria: acessorio?.categoria || 'Acessórios',
    tags: acessorio?.tags || [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.6 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.fotos.length + files.length > 4) {
      alert("Você pode adicionar no máximo 4 fotos por acessório.");
      return;
    }

    try {
      const compressedPhotos = await Promise.all(
        Array.from(files).map(file => compressImage(file as File))
      );

      setFormData(prev => ({
        ...prev,
        fotos: [...prev.fotos, ...compressedPhotos]
      }));
    } catch (error) {
      console.error("Error compressing images:", error);
      alert("Erro ao processar as imagens. Tente novamente.");
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const generateDescription = async () => {
    if (!formData.nome || !formData.aplicacao || formData.aplicacao.length === 0) {
      alert("Preencha o nome e a aplicação do acessório antes de gerar a descrição.");
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key não configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const aplicacaoText = Array.isArray(formData.aplicacao) ? formData.aplicacao.join(', ') : formData.aplicacao;
      const prompt = `Crie uma descrição comercial atraente para um acessório de moto.
      Nome do produto: ${formData.nome}
      Aplicação (motos compatíveis): ${aplicacaoText}
      
      A descrição deve ser persuasiva, destacar os benefícios, ser formatada em parágrafos curtos e usar emojis. Não inclua o preço.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setFormData(prev => ({ ...prev, descricao: response.text }));
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      alert("Erro ao gerar descrição com IA. Verifique a chave da API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fotos.length === 0) {
      alert("Adicione pelo menos uma foto do acessório.");
      return;
    }
    
    setIsSuccess(true);
    setTimeout(() => {
      onSave(formData);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black p-6 text-white flex items-center justify-between border-b border-purple-600">
        <div className="flex items-center gap-3">
          <Tag className="text-purple-500" size={28} />
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {acessorio ? 'Editar' : 'Novo'} <span className="text-purple-600">Acessório</span>
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <X size={24} className="text-zinc-400 hover:text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Fotos */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider">Fotos do Produto</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.fotos.map((foto, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-800">
                <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-zinc-700 hover:border-purple-500 hover:bg-purple-500/5 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-purple-500 transition-all"
            >
              <Camera size={32} />
              <span className="text-xs font-bold uppercase tracking-wider">Adicionar Foto</span>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-3">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {(config.categorias?.length ? config.categorias : ['Kit Transmissão', 'Peças Elétricas', 'Carenagem', 'Acessórios', 'Capacetes', 'Outros']).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, categoria: cat})}
                  className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                    (formData.categoria || 'Acessórios') === cat
                      ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome do Acessório</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white font-bold"
              placeholder="Ex: Baú Givi 45L"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Marca da Moto</label>
            <MultiSelectDropdown 
               options={config.marcas || []}
               value={formData.marcaMoto || []}
               onChange={(val) => setFormData({...formData, marcaMoto: val})}
               placeholder="Selecione Marcas (Opcional)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Modelo da Moto</label>
            <MultiSelectDropdown 
               options={config.motos || []}
               value={formData.modeloMoto || []}
               onChange={(val) => setFormData({...formData, modeloMoto: val})}
               placeholder="Selecione Modelos (Opcional)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Aplicação (Outras Motos/Versão)</label>
            <TagsInput 
               value={formData.aplicacao || []}
               onChange={(val) => setFormData({...formData, aplicacao: val})}
               placeholder="Ex: Honda PCX (Aperte Enter)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Descrição Detalhada</label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={isGenerating || !formData.nome || !formData.aplicacao || formData.aplicacao.length === 0}
              className="flex items-center gap-2 text-xs font-bold text-purple-500 hover:text-purple-400 uppercase tracking-wider disabled:opacity-50 transition-colors"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Gerar com IA
            </button>
          </div>
          <textarea
            required
            rows={5}
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white resize-none"
            placeholder="Descreva os detalhes, material, benefícios..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Filtros / Tags (separados por vírgula)</label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => {
              const val = e.target.value;
              const tagsArray = val?.split ? val.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
              setFormData({...formData, tags: tagsArray});
            }}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white font-bold"
            placeholder="Ex: esportivo, led, proteção, viagem"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Preço (R$)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.preco || ''}
              onChange={(e) => setFormData({...formData, preco: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white font-black text-lg"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={formData.emPromocao}
                onChange={(e) => setFormData({...formData, emPromocao: e.target.checked})}
                className="w-4 h-4 rounded border-zinc-700 text-purple-600 focus:ring-purple-600 bg-zinc-950"
              />
              Em Promoção?
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={!formData.emPromocao}
              value={formData.precoPromocional || ''}
              onChange={(e) => setFormData({...formData, precoPromocional: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white font-black text-lg disabled:opacity-50"
              placeholder="Preço com desconto"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Qtd. em Estoque</label>
            <input
              type="number"
              required
              min="0"
              value={formData.estoque}
              onChange={(e) => setFormData({...formData, estoque: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition-all text-white font-bold"
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 border border-zinc-700 rounded-xl text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSuccess}
            className={`flex-[2] px-6 py-4 rounded-xl font-black transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
              isSuccess 
                ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105' 
                : 'bg-purple-600 text-black hover:bg-purple-500 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle size={20} className="animate-bounce" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Acessório
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
