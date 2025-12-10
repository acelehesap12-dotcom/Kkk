import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
