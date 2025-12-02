import React from 'react';
import { CONCEPT_CATEGORIES } from '../constants';

interface ConceptSelectorProps {
  selectedConcept: string | null;
  onSelectConcept: (conceptKey: string) => void;
}

const ConceptSelector: React.FC<ConceptSelectorProps> = ({ selectedConcept, onSelectConcept }) => {
  return (
    <div className="bg-rose-200 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-bold text-zinc-900 mb-4">2. Chọn concept yêu thích</h2>
      <div className="space-y-5">
        {CONCEPT_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h3 className="text-md font-bold text-zinc-800 mb-1">{category.name}</h3>
            <p className="text-xs text-rose-700 italic mb-3">Vibe: {category.vibe}</p>
            <div className="flex flex-wrap gap-2">
              {category.concepts.map((concept) => (
                <button
                  key={concept.key}
                  onClick={() => onSelectConcept(concept.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rose-200 focus:ring-red-500
                    ${selectedConcept === concept.key 
                      ? 'bg-red-500 border-red-500 text-white shadow-md' 
                      : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-100 hover:border-rose-400'
                    }`}
                >
                  {concept.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptSelector;