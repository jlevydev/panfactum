import React, { useState } from 'react';
import styles from './styles.module.css';

type FAQ = {
  question: string;
  answer: JSX.Element;
};

const FAQList: FAQ[] = [
  {
    question: 'How do I join?',
    answer: (
      <>
        We're in invite only alpha. If you want to get an invite <a href='https://forms.office.com/Pages/ResponsePage.aspx?id=VbC8Q8RooEOo0aliYEp8YX5dDnuudopBjaFjXS9z25hURjU3VTRFQThYTjBWOFk2RzI5NlpBSDA5MCQlQCN0PWcu' target="_blank">click here</a>. We'll be launching publicly in the middle of 2023. For any other questions please reach out to <a href='mailto:hello@panfactum.com'>hello@panfactum.com</a>.
      </>
    ),
  },
  {
    question: 'Who can join?', 
    answer: (
      <>
        We only allow creators and their teams (collaborators, agents, etc.) onto the platform to make sure everyone viewing and uploading data is on the same team. Everyone who joins goes through a verification process.
      </>
    ),
  },
  {
    question: 'How do you verify creators?', 
    answer: (
      <>
        When you join the platform we'll ask you for your handles. We'll then have you perform an action that verifies you
        own those handles. That way we know everyone on the platform is who they say they are.
      </>
    ),
  },
  {
    question: 'How do you get contracts?', 
    answer: (
      <>
        We get contracts from creators giving them to us. This could be during onboarding, while evaluating
        a deal using the platform, or just sending them to us (<a href='mailto:hello@panfactum.com'>hello@panfactum.com</a>).
      </>
    ),
  },
  {
    question: 'How do you verify contracts?',
    answer: (
      <>
       We only accept fully executed contracts, meaning both the creator (or their agent) and the brand have signed. Your anonymity is our top priority so we'll never reach out to brands to verify contracts, but we may request invoices or bank statements from creators to confirm the contracts are legitimate. All our contracts are stored securely and there's no personally identifying information shared with other people on the platform.
      </>
    ),
  },
  {
    question: 'Is my data secure?', 
    answer: (
      <>
        Yes, all your data is stored completely securely in a production hardened manner. We will never sell your data
        to any third party or use it in a way you haven't agreed to. Your data is yours and no one else's. To learn more
        about about how we store and protect your data see our <a href='/docs/privacy'>privacy policy</a>.
      </>
    ),
  },
  {
    question: 'How do you make money?', 
    answer: (
      <>
        We charge a monthly subscription for access to the platform.
      </>
    ),
  },
  {
    question: 'So does this help me find brand deals?',
    answer: (
      <>
        No, while there are a ton of great products to help creators source brand deals, we are not one of them. We're here to support you as you evaluate deals coming down the pipeline. Get a deal from a new brand and unsure if it's good? Come to us to get a sense of where that deal fits into the market.
      </>
    ),
  },
  {
    question: 'I have an agent or manager. Is this for me?',
    answer: (
      <>
        Absolutely! You can add fellow collaborators and agents to your organization. Now you and your whole team have a single place to go when you want to evaluate a deal!
      </>
    ),
  },
  {
    question: 'I am an agent or manager. Is this for me?',
    answer: (
      <>
        Yes! As said above any of your creators can add you to their organizations. We also offer an enterprise product
        for management companies and agencies that want to use the product for their entire organization. Reach out to <a href='mailto:hello@panfactum.com'>hello@panfactum.com</a> for more information.
      </>
    ),
  },
  {
    question: 'What platforms do you support deals from?',
    answer: (
      <>
        Right now we support deals from YouTube, Instagram, and Tiktok.
      </>
    ),
  },
  {
    question: 'Who\'s behind the scenes at panfactum?',
    answer: (
      <>
        Jack and Josh founded panfactum. In our day jobs we've worked together as software engineers helping small to mid sized start ups. Josh is also a stand up comic in NYC and interacting with comics and creators
        inspired the idea for panfactum. Say hi to us at <a href='mailto:josh@panfactum.com'>josh@panfactum.com</a> and <a href='mailto:jack@panfactum.com'>jack@panfactum.com</a>.
      </>
    ),
  },
  {
    question: 'I love this idea, how can I help?', 
    answer: (
      <>
        We're building as fast as we can and the most important thing right now is launching with as much data as possible so that we can help creators of all kinds from day one. Have fully executed contracts? Send them to us at <a href='mailto:hello@panfactum.com'>hello@panfactum.com</a> with the subject "CONTRACTS: YOUR_HANDLE_HERE". We'll verify your contracts, reach out, and  <b>get you a spot on the platform with a month free per contract</b>!
      </>
    ),
  },
];

function QuestionAnswer({question, answer}: FAQ) {

  return (
    <div className="col">
      <a id={question.replace(/\s/g, "-")}>
        <div>
          <h3>{question}</h3>
        </div>
      </a>
      <div>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ(): JSX.Element {

  return (
    <section className={styles.features}>
      <div className="container">
        <div>
          <h1>FAQ</h1>
        </div>
        <div className="col">
          {FAQList.map((props, idx) => (
            <QuestionAnswer key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
