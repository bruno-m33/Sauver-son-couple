/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { HeartCrack, Search, Loader2, BookOpen, ArrowRight, AlertCircle, Copy, Check } from 'lucide-react';
import coursesData from './courses.json';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const coursesList = coursesData.map(c => `- Titre: ${c.title}\n  Lien: ${c.url}`).join('\n\n');
      
      const prompt = `
Tu es un expert en relations de couple et tu connais parfaitement le catalogue de formations de Bruno Marchal.
Un utilisateur traverse une crise de couple et te pose la question / décrit la situation suivante :
"${query}"

Voici le catalogue complet des formations de Bruno Marchal :

${coursesList}

Ta tâche :
1. Fais preuve d'empathie et donne un conseil par rapport à sa situation. 
IMPORTANT SUR LE TON ET LE STYLE :
- Utilise un ton beaucoup plus léger, percutant et motivant.
- Alterne CONSTAMMENT la longueur de tes phrases. Chaque phrase doit avoir une longueur totalement différente de la précédente.
- Varie les longueurs : de très court (5 mots) à 2 lignes maximum. Ne fais jamais deux phrases de la même longueur.
- Utilise une syntaxe simple et directe.
- Saute souvent des lignes pour donner du rythme.
- Adresse-toi obligatoirement à l'utilisateur en le vouvoyant (utilise "vous").
- Termine ton message d'introduction par "Grintaaaaa 🏴☠️"

Voici un exemple EXACT du style de rédaction que tu dois adopter :
"Alors continuez.

Continuez à vous former.
Continuez à appliquer.
Continuez à ajuster.

Même quand c’est inconfortable.

Même quand ça semble lent.

Parce que ce que vous êtes en train de devenir…

est bien plus puissant
que ce que vous étiez hier.

Tenez la barre.

Même quand la mer est agitée.

Parce que vous êtes en train de construire quelque chose de vrai.

Grintaaaaa 🏴☠️"

2. Sélectionne OBLIGATOIREMENT les 5 formations les plus pertinentes dans le catalogue fourni pour l'aider à surmonter cette situation spécifique.
3. Pour chaque formation, donne son titre exact, explique brièvement pourquoi elle est adaptée à sa situation (toujours avec des phrases courtes et percutantes), et inclus le lien vers la formation.

IMPORTANT : N'utilise AUCUNE mise en forme Markdown (pas de gras, pas d'italique, pas de crochets, pas d'astérisques). Écris uniquement du texte brut avec des passages à la ligne.
Tu dois OBLIGATOIREMENT sauter une ligne (laisser une ligne vide) après le titre de chaque formation, et sauter une ligne après le lien de chaque formation.

Format de réponse attendu (TEXTE BRUT UNIQUEMENT) :
[Votre message d'empathie et conseil avec le style court et percutant demandé, terminé par Grintaaaaa 🏴☠️]

Les 5 formations recommandées pour vous :

1. Titre de la formation 1

Lien : URL de la formation 1

Pourquoi cette formation : [Explication courte et percutante]


2. Titre de la formation 2

Lien : URL de la formation 2

Pourquoi cette formation : [Explication courte et percutante]

... et ainsi de suite jusqu'à 5.
`;

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite-preview',
        contents: prompt,
        config: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          setResponse(fullText);
        }
      }

      if (!fullText) {
        setResponse("Désolé, je n'ai pas pu générer de réponse.");
      }
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      setError(err.message || "Une erreur s'est produite lors de la recherche des formations. Veuillez vérifier votre connexion ou réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
            <HeartCrack size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Sauver Son Couple - Recommandations</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-2xl font-semibold mb-2">Trouvez la formation adaptée à votre situation</h2>
            <p className="text-slate-600">
              Décrivez ce que vous traversez actuellement dans votre couple (ex: "Je stresse beaucoup pendant la crise de mon conjoint", "Mon partenaire veut faire un break"). Nous vous proposerons les 5 formations de Bruno Marchal les plus pertinentes.
            </p>
          </div>
          
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-2">
                  Votre situation ou question :
                </label>
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: Je stresse beaucoup pendant la crise de mon conjoint..."
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Trouver des solutions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p>{error}</p>
          </div>
        )}

        {response !== null && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Recommandations personnalisées</h2>
              </div>
              {response !== '' && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                  title="Copier la réponse"
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{isCopied ? 'Copié !' : 'Copier'}</span>
                </button>
              )}
            </div>
            <div className="p-6 sm:p-8 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {response === '' ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="animate-pulse">Analyse de votre situation en cours...</span>
                </div>
              ) : (
                response
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

