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
const VALID_CODES = languages.map((l) => l.code);

function getInitialLang(): LangCode {
  /* The anti-flash script in layout.tsx already set data-lang on <html>
     before React hydrated. Reading it here is instant — no localStorage
     delay, no flash. Falls back to localStorage then "en". */
  try {
    const fromAttr = document.documentElement.getAttribute("data-lang") as LangCode;
    if (fromAttr && VALID_CODES.includes(fromAttr)) return fromAttr;
    const fromStorage = localStorage.getItem(STORAGE_KEY) as LangCode;
    if (fromStorage && VALID_CODES.includes(fromStorage)) return fromStorage;
  } catch {}
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    /* On mount, read the lang that the anti-flash script already applied */
    const initial = getInitialLang();
    if (initial !== "en") {
      setLangState(initial);
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

export function useT() {
  return useContext(LanguageContext).t;
}

/** Inline translated text — safe to use inside Server Components. */
export function T({ id }: { id: string }) {
  const t = useT();
  return <>{t(id)}</>;
}
