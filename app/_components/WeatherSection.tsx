import { getTranslations } from "next-intl/server";
import { weatherData } from "@/app/_data/weather";
import styles from "./WeatherSection.module.css";

export default async function WeatherSection() {
  const t = await getTranslations("home");

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{t("weather")}</h2>
        <div className={styles.rule} />
        <span className={styles.updated}>{t("weatherUpdated")}</span>
      </div>

      <div className={styles.strip}>
        {weatherData.map((city) => (
          <div key={city.city} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.cityName}>{city.city}</p>
                <p className={styles.country}>{city.country}</p>
              </div>
              <span className={styles.icon}>{city.icon}</span>
            </div>

            <div className={styles.tempRow}>
              <span className={styles.temp}>{city.tempC}°</span>
              <span className={styles.tempUnit}>C</span>
              <span className={styles.tempDivider}>/</span>
              <span className={styles.tempF}>{city.tempF}°F</span>
            </div>

            <p className={styles.condition}>{city.condition}</p>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>{t("weatherH")}</span>
                <span className={styles.detailValue}>{city.high}°</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>{t("weatherL")}</span>
                <span className={styles.detailValue}>{city.low}°</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>{t("weatherHumidity")}</span>
                <span className={styles.detailValue}>{city.humidity}%</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>{t("weatherWind")}</span>
                <span className={styles.detailValue}>{city.wind} km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
