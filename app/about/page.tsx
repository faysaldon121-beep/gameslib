
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About Gameslib</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
         Gameslib is your go-to spot for free PC games that are ready to play—no complicated setup, no fuss. We handpick and organize thousands of titles across every genre you can think of, from adrenaline-fueled shooters and deep, story-driven RPGs to clever indie gems you’ll get hooked on fast. Just browse, download directly, and jump in.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe gaming should be accessible to everyone. That's why we offer a vast library of
          games that are ready to play immediately after download – no installation hassles, no hidden
          fees. Every game is tested to ensure it runs smoothly on modern systems.
        </p>
        <h2>Why Choose Gameslib?</h2>
        <ul>
          <li>✓ 100% free downloads</li>
          <li>✓ Pre-installed, portable games – just unzip and play</li>
          <li>✓ Detailed system requirements and user ratings</li>
          <li>✓ New games added daily</li>
          <li>✓ Safe, verified downloads with no malware</li>
        </ul>
        <h2>Our Story</h2>
        <p>
          Gameslib was founded by a group of gamers who were frustrated with complicated installation
          processes and hidden costs. We set out to create a platform where players can discover and
          enjoy games without barriers. Today, we're proud to serve a community of millions of gamers
          worldwide.
        </p>
        <h2>Get Involved</h2>
        <p>
          Have a game suggestion or want to contribute? Visit our <a href="/request">Request a Game</a>{' '}
          page or contact us via the form below. We're always looking to expand our library based on
          community feedback.
        </p>
      </div>
    </main>
  );
}
