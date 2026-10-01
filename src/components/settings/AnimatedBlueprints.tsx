import { HeroBackdrop, type SceneId } from "../hero/HeroBackdrop";
import blueprints from "./blueprints.json";
import styles from "./AnimatedBlueprints.module.css";

const scenes: SceneId[] = ["hospital", "ship", "farm", "school", "care", "city"];

// The six plans and node locations are taken from hospital deck slide 9.
export function AnimatedBlueprints() {
  return (
    <div className={styles.grid}>
      {blueprints.map(({ title, svg }, index) => (
        <figure key={title} className={styles.plan}>
          <figcaption className={styles.title}>{title}</figcaption>
          <div
            className={styles.drawing}
            aria-hidden="true"
          >
            <div dangerouslySetInnerHTML={{ __html: svg }} />
            <HeroBackdrop scene={scenes[index]} overlayOnly />
          </div>
        </figure>
      ))}
    </div>
  );
}
