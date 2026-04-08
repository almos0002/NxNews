"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && languages.some((l) => l.code === stored)) {
      applyLang(stored);
      setLangState(stored);
    }
  }, []);

  function applyLang(code: LangCode) {
    const meta = languages.find((l) => l.code === code)!;
    const root = document.documentElement;
    root.setAttribute("data-lang", code);
    root.setAttribute("lang", code);
    root.setAttribute("dir", meta.dir);
  }

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    applyLang(code);
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

/** Shorthand hook — just returns the t() function */
export function useT() {
  return useContext(LanguageContext).t;
}

/**
 * `<T id="key" />` — Inline translated text.
 * Use inside Server Components: they can render Client Components.
 */
export function T({ id }: { id: string }) {
  const t = useT();
  return <>{t(id)}</>;
}
