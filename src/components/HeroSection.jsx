import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import heroIA from '../assets/heroIA.lottie';

const HeroSection = () => {
  return (
    <section className="p-8 bg-gradient-custom h-auto">
      <div className="container flex gap-10 items-center">
        {/* Left Side: Text and Button */}
        {/* <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-text-dark mb-2">
            EL OBSERVATORIO DE LA IA
          </h1>
          <h2 className="text-2xl font-normal text-text-medium mb-5">
            Un proyecto de la UCE
          </h2>
          <p className="text-base text-text-medium mb-5">
            ¿Te interesa el trabajo del Observatorio de la Inteligencia Artificial
            en el Trabajo y la Sociedad?
          </p>
          <button className="px-5 py-2 bg-transparent border-2 border-pink-accent text-pink-accent font-bold rounded-md hover:bg-pink-accent hover:text-white transition-all">
            HAGA CLIC AQUÍ PARA OBTENER MÁS INFORMACIÓN
          </button>
        </div> */}
        <div className='p-5 max-w-xl flex flex-col gap-3'>
          <h1 className="text-6xl font-bold text-text-dark mb-2">
            Observatorio de Inteligencia Artificial
          </h1>
          <p className="text-xl text-text-medium mb-5">
            ¿Te interesa el trabajo del Observatorio de la Inteligencia Artificial
            en el Trabajo y la Sociedad?
          </p>
          <button className="px-5 py-2 bg-transparent border-2 border-pink-accent text-pink-accent font-bold rounded-md hover:bg-pink-accent hover:text-white transition-all">
            MÁS INFORMACIÓN
          </button>
        </div>
        
        <DotLottieReact
          src={heroIA}
          loop
          autoplay
        />

      </div>
      
    </section>
  )
}

export default HeroSection