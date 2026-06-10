import React, { useRef, useState } from 'react';
import { Save, Upload, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { useThemeConfig } from '../hooks/useThemeConfig';
import { motion } from 'motion/react';

const COLOR_OPTIONS = [
  { name: 'Roxo (Original)', primary: '#7C3AED', hover: '#8b5cf6' },
  { name: 'Azul', primary: '#2563EB', hover: '#3b82f6' },
  { name: 'Verde', primary: '#16A34A', hover: '#22c55e' },
  { name: 'Laranja', primary: '#EA580C', hover: '#f97316' },
  { name: 'Vermelho', primary: '#DC2626', hover: '#ef4444' },
  { name: 'Prata / Zinc', primary: '#71717A', hover: '#a1a1aa' },
];

export default function AdminThemeCustomizer() {
  const { theme, updateTheme, loading } = useThemeConfig();
  const [siteName, setSiteName] = useState('');
  const [contactWhatsApp, setContactWhatsApp] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state initially once loaded
  React.useEffect(() => {
    if (!loading) {
      if (!siteName) setSiteName(theme.siteName);
      if (!contactWhatsApp && theme.contactWhatsApp) setContactWhatsApp(theme.contactWhatsApp);
    }
  }, [loading, theme.siteName, theme.contactWhatsApp, siteName, contactWhatsApp]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await updateTheme({ logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await updateTheme({ siteName, contactWhatsApp });
    setSaving(false);
  };

  if (loading) return <div className="text-white text-center py-10">Carregando tema...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Palette className="text-purple-500" size={32} />
            Personalizar <span className="text-purple-600">Site</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1 font-bold">Ajuste o nome, a logo e as cores do painel (temporário até o refresh).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* NOME DO SITE & WHATSAPP */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Type className="text-purple-500" size={20} />
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Nome do Site</h3>
            </div>
            <p className="text-sm text-zinc-400 font-bold mb-4">Altere o título exibido no cabeçalho do sistema.</p>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-bold uppercase"
              placeholder="Ex: V E C T U R A"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* @ts-ignore - Phone icon from lucide-react */}
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">WhatsApp para Contato</h3>
            </div>
            <p className="text-sm text-zinc-400 font-bold mb-4">Número de destino para "Enviar Proposta via WhatsApp".</p>
            <input
              type="text"
              value={contactWhatsApp}
              onChange={(e) => setContactWhatsApp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-bold"
              placeholder="Ex: 5582999999999"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              Salvar Informações
            </button>
          </div>
        </div>

        {/* LOGO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-purple-500" size={20} />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Logotipo</h3>
          </div>
          <p className="text-sm text-zinc-400 font-bold mb-4">Faça upload de uma pequena imagem para acompanhar o título.</p>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon size={24} className="text-zinc-600" />
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Escolher Imagem
            </button>
            
            {theme.logoUrl && (
              <button
                onClick={() => updateTheme({ logoUrl: '' })}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                title="Remover Logo"
              >
                X
              </button>
            )}
          </div>
        </div>

        {/* PALETA DE CORES */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-purple-500" size={20} />
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Paleta de Cores</h3>
          </div>
          <p className="text-sm text-zinc-400 font-bold mb-6">Mude a cor principal de destaque de todo o sistema com um clique.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {COLOR_OPTIONS.map((color) => {
              const isActive = theme.primaryColor === color.primary;
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={color.name}
                  onClick={() => updateTheme({ primaryColor: color.primary, primaryHoverColor: color.hover })}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${isActive ? 'border-white bg-zinc-800' : 'border-transparent bg-zinc-950 hover:border-zinc-700'}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-lg border border-black/20"
                    style={{ backgroundColor: color.primary }}
                  />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{color.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
