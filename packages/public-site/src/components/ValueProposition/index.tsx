import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type ValuePropItem = {
  title: string;
  description: JSX.Element;
};

const ValuePropList: ValuePropItem[] = [
  {
    title: 'What\'s the Problem?',
    description: (
      <>
        Getting a brand deal is exciting, but how do you know you're not getting f#*@!d<a href='#1'><sup>1</sup></a>?
      </>
    ),
  },
  {
    title: 'What panfactum Does',
    description: (
      <>
        We give you tools to understand the value of a deal. Get paid on your terms, it's your kitchen.
      </>
    ),
  },
  {
    title: 'How We Do It',
    description: (
      <>
        We collect brand deals from creators so that you can see what everyone else is cooking with.
      </>
    ),
  },
];

function ValueProp({title, description}: ValuePropItem) {
  return (
    <div style={{padding: "2.5rem"}} className="text--center padding-horiz--lg col col-4">
      <h2>{title}</h2>
      <p style={{fontSize: "1.25em"}}>{description}</p>
    </div>
  );
}

export default function ValueProposition(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {ValuePropList.map((props, idx) => (
            <ValueProp key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
