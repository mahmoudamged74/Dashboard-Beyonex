import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCode, MdPeople, MdShowChart } from 'react-icons/md';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { t } = useTranslation();

  // const stats = [
  //   { title: t('stats.new_clients'), value: '124', icon: <MdPeople />, desc: t('stats.desc_clients') },
  //   { title: t('stats.projects_done'), value: '45', icon: <MdCode />, desc: t('stats.desc_projects') },
  //   { title: t('stats.revenue'), value: '$12k', icon: <MdShowChart />, desc: t('stats.desc_revenue') },
  // ];

  return (
    <div className={`fade-in ${styles.dashboard}`}>
      <div className={styles.hero}>
        <img src="/assets/slide1.jpg" alt="Background" className={styles.heroBg} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('welcome')}</h1>
          <p className={styles.subtitle}>{t('software_company')}</p>
          {/* <button className="btn-primary">
            {t('explore')}
          </button> */}
        </div>
      </div>

      {/* {stats.map((stat, index) => (
        <div key={index} className={`glass-panel ${styles.card}`}>
          <div className={styles.cardIcon}>{stat.icon}</div>
          <h3 className={styles.cardTitle}>{stat.title}</h3>
          <div className={styles.cardValue}>{stat.value}</div>
          <p className={styles.cardDesc}>{stat.desc}</p>
        </div>
      ))} */}
    </div>
  );
};

export default Dashboard;
