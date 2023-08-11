import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ValueProposition from '@site/src/components/ValueProposition';

import styles from './index.module.css';
import FAQ from '../components/FAQ';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">Know your worth.</h1>
        <p className="hero__subtitle">
          Panfactum provides the data and analytics on brand deals for creators.
          Spend less time negotiating and more time creating.
        </p>
        <a href='https://forms.office.com/Pages/ResponsePage.aspx?id=VbC8Q8RooEOo0aliYEp8YX5dDnuudopBjaFjXS9z25hURjU3VTRFQThYTjBWOFk2RzI5NlpBSDA5MCQlQCN0PWcu' target="_blank">
          <button style={{"font-size": "18px"}} className='button button--secondary'>Sign Up for the Waitlist</button>
        </a>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Know your worth.">
      <HomepageHeader />
      <main>
        <ValueProposition />
        <HomepageFeatures />
        <FAQ />
        <div className='container'>
           <hr></hr>
          <div className='col'>
            <a id='1'><p>1. Fried</p></a>
          </div>
        </div>
      </main>
    </Layout>
  );
}
