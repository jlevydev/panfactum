import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'img'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Dashboards',
    Svg: require('@site/static/img/graph.svg').default, 
    description: (
      <>
        Our filterable dashboards give you all the data you need to quickly 
        understand the market. Want to know the average pay for a beauty brand deal to a creator with ~200k follows? 
        We got you. Slice and dice the data any way you please.
      </>
    ),
  },
  {
    title: 'Reviews',
    Svg: require('@site/static/img/star.svg').default, 
    description: (
      <>
        Get insight on what brands have the best deals, pay on time, and are the easiest to work with. Avoid the bad eggs.
      </>
    ),
  },
  {
    title: 'Verification',
    Svg: require('@site/static/img/contract.svg').default,  
    description: (
      <>
        We verify all creator and deal data to ensure legitimacy. 
        The data is cleansed and aggregated so that no personal data is ever posted. All our deals are certified fresh. 
      </>
    ),
  },
  {
    title: 'Coaching',
    Svg: require('@site/static/img/lawyer.svg').default, 
    description: (
      <>
        Compare your incoming offers on to similar deals that have happened recently. Get 1-on-1 support and curated data
        on upcoming deals to negotiate with confidence. Become a master chef.
      </>
    ),
  },
  {
    title: 'Drawer',
    Svg: require('@site/static/img/drawer.svg').default, 
    description: (
      <>
        A central place for you, your team and your managers to store deals and offers. Ensure that everybody is working
        from the same cook book. 
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className='row'>
      <div className="text--center padding-horiz--md col col--6">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="text--center col col--6">
        <Svg className={styles.featureSvg} role="img" />
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section >
      <div className="container">
        <h1 style={{"margin-bottom": "2.5rem", "font-size": "3rem"}}className="text--center">Core Product Features</h1>
        <div className="col">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props}/>
          ))}
        </div>
      </div>
    </section>
  );
}