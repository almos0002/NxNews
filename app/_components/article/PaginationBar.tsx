import Link from "next/link";
import styles from "./PaginationBar.module.css";

interface Props {
  page: number;
  totalPages: number;
  params?: Record<string, string>;
}

export default function PaginationBar({ page, totalPages, params = {} }: Props) {
  if (totalPages <= 1) return null;

  function href(p: number) {
    const sp = new URLSearchParams({ ...params, page: String(p) });
    return `?${sp.toString()}`;
  }

  const delta = 2;
  const range: number[] = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }
  const showStartEllipsis = range[0] > 2;
  const showEndEllipsis = range[range.length - 1] < totalPages - 1;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className={styles.arrow}
          aria-label="Previous page"
          rel="prev"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.disabled}`} aria-disabled="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      )}

      {range[0] > 1 && (
        <>
          <Link href={href(1)} className={styles.pageNum}>1</Link>
          {showStartEllipsis && <span className={styles.ellipsis}>…</span>}
        </>
      )}

      {range.map((p) => (
        p === page ? (
          <span key={p} className={`${styles.pageNum} ${styles.pageActive}`} aria-current="page">{p}</span>
        ) : (
          <Link key={p} href={href(p)} className={styles.pageNum}>{p}</Link>
        )
      ))}

      {range[range.length - 1] < totalPages && (
        <>
          {showEndEllipsis && <span className={styles.ellipsis}>…</span>}
          <Link href={href(totalPages)} className={styles.pageNum}>{totalPages}</Link>
        </>
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className={styles.arrow}
          aria-label="Next page"
          rel="next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.disabled}`} aria-disabled="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </nav>
  );
}
