import { PartnerCharacter } from "@/components/partners/PartnerCharacter";
import styles from "./partners.module.css";

export function PartnerChoices() {
  return <div className={styles.choices}>
      <a className={styles.choice} href="/for-hospitals/">
        <div className={styles.stage}><PartnerCharacter kind="doctor" /></div>
        <div className={styles.caption}><h2>For hospitals</h2></div>
      </a>
      <a className={styles.choice} href="/for-farms/">
        <div className={styles.stage}><PartnerCharacter kind="pig" /></div>
        <div className={styles.caption}><h2>For farms</h2></div>
      </a>
    </div>;
}
