import React from 'react';


const ParticleWaveBackground: React.FC = () => (
  <div className="galaxy-background" aria-hidden="true">
    <div className="galaxy-background__nebula" />
    <div className="galaxy-background__stars galaxy-background__stars--far" />
    <div className="galaxy-background__stars galaxy-background__stars--near" />
    <div className="galaxy-background__planet" />
    <div className="galaxy-background__alien">
      <img className="galaxy-background__alien-image" src="/assets/alian.jpg" alt="" />
      <span className="galaxy-background__orbit" />
    </div>
    <div className="galaxy-background__vignette" />
  </div>
);

export default ParticleWaveBackground;
