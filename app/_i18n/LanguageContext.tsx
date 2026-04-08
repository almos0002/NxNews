"use client";

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type LangCode,
  type LangMeta,
  languages,
  translate,
} from "./translations";

interface LanguageContextValue {
  lang: LangCode;
  meta: LangMeta;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  meta: languages[0],
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "tdr-lang";
const VALID_CODES = languages.map((l) => l.code);

function applyToDOM(code: LangCode) {
  const meta = languages.find((l) => l.code === code)!;
  const root = document.documentElement;
  root.setAttribute("data-lang", code);
  root.setAttribute("lang", code);
  root.setAttribute("dir", meta.dir);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  /* useLayoutEffect runs synchronously after DOM paint — the user never
     sees the default "en" render if they have another language saved. */
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (stored && VALID_CODES.includes(stored) && stored !== "en") {
        setLangState(stored);
        applyToDOM(stored);
      }
    } catch {}
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
    applyToDOM(code);
  }, []);

  const t = useCallback(
    (key: string) => translate(lang, key),
    [lang]
  );

  const meta = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <LanguageContext.Provider value={{ lang, meta, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  return useContext(LanguageContext).t;
}

export function T({ id }: { id: string }) {
  const t = useT();
  return <>{t(id)}</>;
}
