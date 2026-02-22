import React from 'react';

const SuiviChantier = ({ clientName, etapeActuelle }) => {
  const totalEtapes = 12;
  
  // Liste des noms d'étapes (vous pourrez les personnaliser)
  const nomsEtapes = [
    "Terrassement", "Fondations", "Murs", "Toiture", 
    "Menuiseries", "Plomberie", "Électricité", "Plâtrerie",
    "Carrelage", "Peinture", "Finitions", "Remise des clés"
  ];

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">{clientName}</h2>
        <p className="text-sm text-gray-500">Avancement de votre projet</p>
      </div>

      {/* Barre de progression visuelle */}
      <div className="flex gap-1 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
        {[...Array(totalEtapes)].map((_, i) => (
          <div 
            key={i}
            className={`flex-1 ${i < etapeActuelle ? 'bg-green-500' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* Détail de l'étape actuelle */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4">
        <p className="text-sm font-medium text-green-800">
          Étape actuelle : {nomsEtapes[etapeActuelle - 1]} ({etapeActuelle}/{totalEtapes})
        </p>
      </div>
    </div>
  );
};

export default SuiviChantier;