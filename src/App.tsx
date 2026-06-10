import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moto, UserProfile, Acessorio, CartItem } from './types';
import MotoList from './components/MotoList';
import MotoForm from './components/MotoForm';
import FinanceCalculator from './components/FinanceCalculator';
import AdminHistory from './components/AdminHistory';
import AdminRates from './components/AdminRates';
import AdminPurchases from './components/AdminPurchases';
import UserProfileModal from './components/UserProfileModal';
import AcessorioList from './components/AcessorioList';
import AcessorioForm from './components/AcessorioForm';
import CartModal from './components/CartModal';
import AdminThemeCustomizer from './components/AdminThemeCustomizer';
import { useThemeConfig } from './hooks/useThemeConfig';
import { Bike, LogIn, LogOut, User as UserIcon, History, Percent, Package, ShoppingCart, Trash2, Menu, ChevronDown, Wrench } from 'lucide-react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, onSnapshot, query, orderBy, doc, setDoc, getDoc, deleteDoc, updateDoc, increment, handleFirestoreError, OperationType } from './firebase';

const VecturaBrandingIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className}
  >
    <defs>
      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
      <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E5E5E5" />
      </linearGradient>
      <filter id="shadowOver" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="-2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    <g transform="translate(48, 85) rotate(-30) translate(-12, -75)">
       <rect x="0" y="0" width="24" height="85" rx="12" fill="url(#purpleGrad)" />
    </g>

    <g transform="translate(52, 85) rotate(30) translate(-12, -75)">
       <rect x="0" y="0" width="24" height="85" rx="12" fill="url(#whiteGrad)" filter="url(#shadowOver)" />
    </g>
  </svg>
);

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'finance' | 'acessorios' | 'add_acessorio' | 'edit_acessorio'>('list');
  const [adminTab, setAdminTab] = useState<'estoque' | 'vendas' | 'taxas' | 'compra'>('estoque');
  const [motos, setMotos] = useState<Moto[]>([]);
  const [acessorios, setAcessorios] = useState<Acessorio[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<Moto | null>(null);
  const [selectedAcessorio, setSelectedAcessorio] = useState<Acessorio | null>(null);
  const [motoToDelete, setMotoToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { theme } = useThemeConfig();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'motos'), orderBy('marcaModelo'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const motosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Moto));
      setMotos(motosData);
      
      // Seeding logic: if admin and no motos, add initial ones
      if (isAdmin && motosData.length === 0) {
        const initialMotos = [
          {
            placa: 'PNN8564',
            marcaModelo: 'YAMAHA/NMAX',
            anoFabricacao: 2018,
            anoModelo: 2018,
            quilometragem: '30.000km',
            precoAVista: 15000,
            statusRevisao: 'REVISADA',
            statusDut: 'DUT INCLUSO',
            fotos: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800']
          },
          {
            placa: 'PNB3196',
            marcaModelo: 'HONDA/PCX 150',
            anoFabricacao: 2015,
            anoModelo: 2015,
            quilometragem: '45.000km',
            precoAVista: 12000,
            statusRevisao: 'REVISADA',
            statusDut: 'DUT INCLUSO',
            fotos: ['https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&q=80&w=800']
          },
          {
            placa: 'POH2997',
            marcaModelo: 'HONDA/CG 160',
            anoFabricacao: 2018,
            anoModelo: 2018,
            quilometragem: '25.000km',
            precoAVista: 13500,
            statusRevisao: 'REVISADA',
            statusDut: 'DUT INCLUSO',
            fotos: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800']
          }
        ];
        initialMotos.forEach(async (moto) => {
          await setDoc(doc(collection(db, 'motos')), moto);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'motos');
    });

    const qAcessorios = query(collection(db, 'acessorios'), orderBy('nome'));
    const unsubscribeAcessorios = onSnapshot(qAcessorios, (snapshot) => {
      const acessoriosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acessorio));
      setAcessorios(acessoriosData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'acessorios');
    });

    return () => {
      unsubscribe();
      unsubscribeAcessorios();
    };
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        const allowedAdmins = [
          'franklinmotos2023@gmail.com',
          'luizgarciadeoliveiraneto@gmail.com'
        ];
        const isDefaultAdmin = !!firebaseUser.email && allowedAdmins.includes(firebaseUser.email);
        setIsAdmin(isDefaultAdmin);
        setIsSuperAdmin(firebaseUser.email === 'luizgarciadeoliveiraneto@gmail.com');
        
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const currentData = userDoc.data();
            setUserData(currentData);
            
            // Backfill required schema fields if missing
            if (!currentData.email || !currentData.uid || !currentData.role) {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: isDefaultAdmin ? 'admin' : (currentData.role || 'user')
              }, { merge: true });
            }

            if (!currentData.nome || !currentData.cpf || !currentData.cep || !currentData.telefone) {
              setShowProfileModal(true);
            }
          } else {
            setShowProfileModal(true);
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: isDefaultAdmin ? 'admin' : 'user'
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Migration script for existing accessories
  useEffect(() => {
    const migrateAccessories = async () => {
      if (!isAdmin || acessorios.length === 0) return;
      
      for (const acessorio of acessorios) {
        if (!acessorio.categoria) {
          let newCategoria = 'Acessórios';
          const nomeLower = acessorio.nome.toLowerCase();
          
          if (nomeLower.includes('capacete')) {
            newCategoria = 'Capacetes';
          } else if (nomeLower.includes('motor') || nomeLower.includes('vela') || nomeLower.includes('filtro')) {
            newCategoria = 'Kit Transmissão';
          } else if (nomeLower.includes('led') || nomeLower.includes('farol') || nomeLower.includes('bateria')) {
            newCategoria = 'Peças Elétricas';
          } else if (nomeLower.includes('carenagem') || nomeLower.includes('paralama') || nomeLower.includes('retrovisor')) {
            newCategoria = 'Carenagem';
          }

          try {
            await updateDoc(doc(db, 'acessorios', acessorio.id), {
              categoria: newCategoria
            });
          } catch (error) {
            console.error("Migration error:", error);
          }
        }
      }
    };

    migrateAccessories();
  }, [acessorios, isAdmin]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login error:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('list');
      setAdminTab('estoque');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddMoto = () => {
    setSelectedMoto(null);
    setCurrentView('add');
  };

  const handleEditMoto = (moto: Moto) => {
    setSelectedMoto(moto);
    setCurrentView('edit');
  };

  const handleDeleteMoto = (id: string) => {
    setMotoToDelete(id);
  };

  const confirmDeleteMoto = async () => {
    if (!motoToDelete) return;
    try {
      await deleteDoc(doc(db, 'motos', motoToDelete));
      setMotoToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `motos/${motoToDelete}`);
    }
  };

  const handleSaveMoto = async (motoData: Omit<Moto, 'id'>) => {
    try {
      if (currentView === 'edit' && selectedMoto) {
        await setDoc(doc(db, 'motos', selectedMoto.id), motoData);
      } else {
        await setDoc(doc(collection(db, 'motos')), motoData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'motos');
    }
  };

  const handleSaveAcessorio = async (acessorioData: Omit<Acessorio, 'id'>) => {
    try {
      if (currentView === 'edit_acessorio' && selectedAcessorio) {
        await setDoc(doc(db, 'acessorios', selectedAcessorio.id), acessorioData);
      } else {
        await setDoc(doc(collection(db, 'acessorios')), acessorioData);
      }
      setCurrentView('acessorios');
      setSelectedAcessorio(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'acessorios');
    }
  };

  const handleDeleteAcessorio = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'acessorios', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `acessorios/${id}`);
    }
  };

  const handleToggleArchiveAcessorio = async (acessorio: Acessorio) => {
    try {
      await updateDoc(doc(db, 'acessorios', acessorio.id), {
        isArchived: !acessorio.isArchived
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `acessorios/${acessorio.id}`);
    }
  };

  const handleAddStockAcessorio = async (acessorio: Acessorio) => {
    try {
      await updateDoc(doc(db, 'acessorios', acessorio.id), {
        estoque: increment(acessorio.estoque) // The quantity to add is passed in the estoque field from the modal
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `acessorios/${acessorio.id}`);
    }
  };

  const handleCancelAdd = () => {
    setCurrentView('list');
    setSelectedMoto(null);
  };

  const handleFinance = (moto: Moto) => {
    setSelectedMoto(moto);
    setCurrentView('finance');
  };

  const handleConfirmFinance = () => {
    setCurrentView('list');
    setAdminTab('vendas');
  };

  const handleCompleteSale = () => {
    setCurrentView('list');
    setSelectedMoto(null);
  };

  const handleAddToCart = (acessorio: Acessorio) => {
    setCart(prev => {
      const existing = prev.find(item => item.acessorio.id === acessorio.id);
      if (existing) {
        if (existing.quantidade >= acessorio.estoque) return prev;
        return prev.map(item => 
          item.acessorio.id === acessorio.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { acessorio, quantidade: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (acessorioId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.acessorio.id === acessorioId) {
        const newQuantity = Math.max(1, Math.min(item.quantidade + delta, item.acessorio.estoque));
        return { ...item, quantidade: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (acessorioId: string) => {
    setCart(prev => prev.filter(item => item.acessorio.id !== acessorioId));
  };

  const [hasSelectedSection, setHasSelectedSection] = useState(false);

  if (!isAppLoading && !isAdmin && !hasSelectedSection) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col relative selection:bg-purple-500 selection:text-black">
        {/* Top right Login Button */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 hover:text-purple-400 transition-all uppercase tracking-wider shadow-lg"
          >
            {isLoggingIn ? (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Logo */}
          <div className="mb-12 animate-in fade-in zoom-in duration-700 relative z-10">
            {theme.logoUrl ? (
               <img src={theme.logoUrl} alt="Vectura Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-2xl" />
            ) : (
               <VecturaBrandingIcon size={120} />
            )}
          </div>
          
          {/* Titles */}
          <div className="text-center mb-16 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 relative z-10 max-w-2xl px-4">
             <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mb-4 leading-tight">
               Bem-vindo ao nosso catálogo online!
             </h1>
             <p className="text-zinc-400 text-lg md:text-xl font-bold uppercase tracking-wider">
               Qual promoção gostaria de aproveitar hoje?
             </p>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 relative z-10">
             <button 
                onClick={() => {
                  setCurrentView('list');
                  setHasSelectedSection(true);
                }}
                className="flex-1 py-8 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-lg sm:text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-4 group"
             >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                  <Bike size={32} className="text-white group-hover:text-purple-400 transition-colors" />
                </div>
                Motos
             </button>
             <button 
                onClick={() => {
                  setCurrentView('acessorios');
                  setHasSelectedSection(true);
                }}
                className="flex-1 py-8 px-6 bg-purple-600/10 hover:bg-purple-600/20 backdrop-blur-xl border border-purple-600/30 rounded-2xl text-white text-lg sm:text-xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-4 group"
             >
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/40 transition-colors">
                  <Wrench size={32} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                Peças/Acessórios
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isAppLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                x: [-15, 15, -15],
                y: [0, -2, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative text-purple-600 mb-6"
            >
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="w-[80px] h-[80px] object-contain drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
              ) : (
                <VecturaBrandingIcon size={80} className="drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
              )}
              <motion.div 
                className="absolute -bottom-2 -left-4 w-16 h-1 bg-white/20 blur-sm rounded-full"
                animate={{ x: [-20, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div 
                className="absolute -bottom-1 -left-2 w-10 h-1 bg-white/20 blur-sm rounded-full"
                animate={{ x: [-30, 40], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
            </motion.div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest text-center px-4">
              Carregando...
              <span className="block text-purple-600 text-sm mt-2 tracking-widest">Estamos acelerando por você</span>
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-purple-500 selection:text-black">
      {/* Header */}
      <header className="bg-black border-b border-purple-600 shadow-2xl print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => { setCurrentView('list'); setAdminTab('estoque'); }}>
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : null}
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">
                {theme.siteName}
              </h1>
              <span className="hidden md:block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Gestões e Padrões para Negócios
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-1.5 md:gap-6">
            {isAdmin ? (
              <>
                {/* Desktop Tabs */}
                <div className="hidden md:flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                  <button
                    onClick={() => { setCurrentView('list'); setAdminTab('estoque'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                      adminTab === 'estoque' && ['list', 'acessorios'].includes(currentView)
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                        : 'text-zinc-400 hover:text-purple-500'
                    }`}
                  >
                    <Package size={16} /> Estoque
                  </button>
                  <button
                    onClick={() => { setCurrentView('list'); setAdminTab('vendas'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                      adminTab === 'vendas' 
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                        : 'text-zinc-400 hover:text-purple-500'
                    }`}
                  >
                    <History size={16} /> Vendas
                  </button>
                  <button
                    onClick={() => { setCurrentView('list'); setAdminTab('compra'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                      adminTab === 'compra' 
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                        : 'text-zinc-400 hover:text-purple-500'
                    }`}
                  >
                    <ShoppingCart size={16} /> Compra
                  </button>
                  <button
                    onClick={() => { setCurrentView('list'); setAdminTab('taxas'); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                      adminTab === 'taxas' 
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                        : 'text-zinc-400 hover:text-purple-500'
                    }`}
                  >
                    <Percent size={16} /> Taxas
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => { setCurrentView('list'); setAdminTab('personalizacao' as any); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                        adminTab === 'personalizacao' 
                          ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                          : 'text-zinc-400 hover:text-purple-500'
                      }`}
                    >
                      <Menu size={16} /> Personalizar Site
                    </button>
                  )}
                </div>

                {/* Mobile Tabs Dropdown */}
                <div className="relative md:hidden">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider"
                  >
                    {['list', 'acessorios'].includes(currentView) && adminTab === 'estoque' && <><Package size={14} /> Estoque</>}
                    {currentView !== 'acessorios' && adminTab === 'vendas' && <><History size={14} /> Vendas</>}
                    {currentView !== 'acessorios' && adminTab === 'compra' && <><ShoppingCart size={14} /> Compra</>}
                    {currentView !== 'acessorios' && adminTab === 'taxas' && <><Percent size={14} /> Taxas</>}
                    {currentView !== 'acessorios' && adminTab === 'personalizacao' && isSuperAdmin && <><Menu size={14} /> Tema</>}
                    <ChevronDown size={14} className={`transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                      <button
                        onClick={() => { setCurrentView('list'); setAdminTab('estoque'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          adminTab === 'estoque' && ['list', 'acessorios'].includes(currentView) ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <Package size={16} /> Estoque
                      </button>
                      <button
                        onClick={() => { setCurrentView('list'); setAdminTab('vendas'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          adminTab === 'vendas' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <History size={16} /> Vendas
                      </button>
                      <button
                        onClick={() => { setCurrentView('list'); setAdminTab('compra'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          adminTab === 'compra' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <ShoppingCart size={16} /> Compra
                      </button>
                      <button
                        onClick={() => { setCurrentView('list'); setAdminTab('taxas'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          adminTab === 'taxas' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <Percent size={16} /> Taxas
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => { setCurrentView('list'); setAdminTab('personalizacao' as any); setIsMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                            adminTab === 'personalizacao' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <Menu size={16} /> Customizar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop Tabs */}
                <div className="hidden md:flex gap-2">
                  <button
                    onClick={() => { setCurrentView('list'); setAdminTab('estoque'); }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                      currentView === 'list' 
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.5)]' 
                        : 'text-zinc-400 hover:text-purple-500 hover:bg-zinc-900'
                    }`}
                  >
                    Motos
                  </button>
                  <button
                    onClick={() => setCurrentView('acessorios')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                      currentView === 'acessorios' 
                        ? 'bg-purple-600 text-black shadow-[0_0_15px_rgba(124,58,237,0.5)]' 
                        : 'text-zinc-400 hover:text-purple-500 hover:bg-zinc-900'
                    }`}
                  >
                    Acessórios
                  </button>
                </div>

                {/* Mobile Tabs Dropdown */}
                <div className="relative md:hidden">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider"
                  >
                    {currentView === 'list' && <><Package size={14} /> Motos</>}
                    {currentView === 'acessorios' && <><Wrench size={14} /> Acessórios</>}
                    <ChevronDown size={14} className={`transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMobileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                      <button
                        onClick={() => { setCurrentView('list'); setAdminTab('estoque'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          currentView === 'list' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <Package size={16} /> Motos
                      </button>
                      <button
                        onClick={() => { setCurrentView('acessorios'); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all uppercase tracking-wider ${
                          currentView === 'acessorios' ? 'bg-purple-600/10 text-purple-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <Wrench size={16} /> Acessórios
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="hidden md:block h-8 w-px bg-zinc-800 mx-1 md:mx-2" />

            <div className="flex items-center gap-1.5 md:gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 md:p-2.5 bg-zinc-900 text-zinc-400 hover:text-purple-500 hover:bg-zinc-800 rounded-lg md:rounded-xl transition-all border border-zinc-800"
                title="Carrinho"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-purple-600 text-black text-[8px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-black">
                    {cart.reduce((a, b) => a + b.quantidade, 0)}
                  </span>
                )}
              </button>

              {user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">{isAdmin ? 'Modo Admin' : 'Modo Cliente'}</span>
                    <span className="text-xs md:text-sm font-black text-white truncate max-w-[100px] md:max-w-[150px]">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 md:p-2.5 bg-zinc-900 text-zinc-400 hover:text-purple-500 hover:bg-zinc-800 rounded-lg md:rounded-xl transition-all border border-zinc-800"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="p-1.5 md:p-2.5 bg-zinc-900 text-zinc-400 hover:text-purple-500 hover:bg-zinc-800 rounded-lg md:rounded-xl transition-all border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Login Admin"
                >
                  <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 print:p-0 print:max-w-none">
        {currentView === 'acessorios' && (
          <AcessorioList
            acessorios={acessorios}
            isAdmin={isAdmin}
            onAdd={() => setCurrentView('add_acessorio')}
            onEdit={(acessorio) => {
              setSelectedAcessorio(acessorio);
              setCurrentView('edit_acessorio');
            }}
            onDelete={handleDeleteAcessorio}
            onAddToCart={handleAddToCart}
            onToggleArchive={handleToggleArchiveAcessorio}
            onAddStock={handleAddStockAcessorio}
            currentView={currentView}
            onSwitchView={setCurrentView}
          />
        )}

        {(currentView === 'add_acessorio' || currentView === 'edit_acessorio') && (
          <AcessorioForm
            acessorio={selectedAcessorio}
            onSave={handleSaveAcessorio}
            onCancel={() => {
              setCurrentView('acessorios');
              setSelectedAcessorio(null);
            }}
          />
        )}

        {currentView === 'list' && adminTab === 'estoque' && (
          <MotoList
            motos={motos}
            onAddMoto={handleAddMoto}
            onFinance={handleFinance}
            isAdmin={isAdmin}
            onEditMoto={handleEditMoto}
            onDeleteMoto={handleDeleteMoto}
            currentView={currentView}
            onSwitchView={setCurrentView}
          />
        )}

        {currentView === 'list' && adminTab === 'vendas' && isAdmin && (
          <AdminHistory motos={motos} />
        )}

        {currentView === 'list' && adminTab === 'taxas' && isAdmin && (
          <AdminRates motos={motos} />
        )}

        {currentView === 'list' && adminTab === 'compra' && isAdmin && (
          <AdminPurchases />
        )}

        {currentView === 'list' && adminTab === 'personalizacao' && isSuperAdmin && (
          <AdminThemeCustomizer />
        )}

        {(currentView === 'add' || currentView === 'edit') && (
          <MotoForm 
            onSave={handleSaveMoto} 
            onCancel={handleCancelAdd} 
            initialData={selectedMoto || undefined}
          />
        )}

        {currentView === 'finance' && selectedMoto && (
          <FinanceCalculator
            moto={selectedMoto}
            onConfirm={handleConfirmFinance}
            onCancel={() => setCurrentView('list')}
            isAdmin={isAdmin}
            userData={userData}
          />
        )}
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={() => setCart([])}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={(data) => {
            setUserData(data);
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {motoToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-red-600/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Excluir Moto?</h3>
              <p className="text-zinc-400 text-sm mt-2">Esta ação não pode ser desfeita. A moto será removida permanentemente do estoque.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setMotoToDelete(null)}
                className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteMoto}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
