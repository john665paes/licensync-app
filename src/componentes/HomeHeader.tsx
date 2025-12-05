import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../estilos/themes';

// Não esquecer, deixar limpo para exibir apenas no topodas pags 
// sem informação, inserir info conforme a pagina
const HomeHeader: React.FC = () => {
  return (
    <View style={styles.container} backgroundColor={theme.colors.primary}>
      <Text style={styles.title}>Home Header</Text>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 50, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
});

export default HomeHeader;



// import React from 'react';
// import { Bell } from 'lucide-react'; // Ícones para React (web)

// /**
//  * Um componente de cabeçalho reutilizável com fundo verde,
//  * saudação ao usuário e ícone de notificação.
//  */
// export default function UserProfileHeader() {
//   return (
//     // 1. CABEÇALHO (VERDE)
//     // Usamos 'bg-emerald-600' do Tailwind para o fundo verde.
//     // 'p-4' adiciona preenchimento, 'text-white' define a cor do texto padrão.
//     <header className="bg-emerald-600 p-4 text-white shadow-md rounded-b-lg">
      
//       {/* Container para alinhar o conteúdo */}
//       {/* 'flex' ativa o flexbox, 'items-center' alinha verticalmente */}
//       {/* 'justify-between' empurra a imagem/texto para a esquerda e o sino para a direita */}
//       <div className="flex items-center justify-between max-w-6xl mx-auto">
        
//         {/* Lado Esquerdo: Imagem e Texto */}
//         <div className="flex items-center space-x-4">
//           {/* Imagem de Perfil */}
//           <img
//             src="https://i.pravatar.cc/100" // Imagem placeholder
//             alt="Foto de perfil"
//             className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
//           />
          
//           {/* Container da Saudação */}
//           <div>
//             <p className="text-sm text-emerald-100">Bom-dia!</p>
//             <p className="text-xl font-semibold">Gabriela Saraiva</p>
//           </div>
//         </div>
        
//         {/* Lado Direito: Ícone de Notificação */}
//         {/* Usamos <button> para acessibilidade, 'relative' para o ponto de notificação */}
//         <button className="relative p-2 rounded-full hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-white">
//           <Bell size={24} color="#FFFFFF" />
//           {/* Ponto de notificação (opcional) */}
//           <span className="absolute top-2 right-2 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-600"></span>
//         </button>
        
//       </div>
//     </header>
//   );
// }