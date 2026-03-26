export const runtime = 'edge';
import Link from 'next/link';

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

const LEGAL_CONTENT: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: `ListingBooth.com ("we," "our," or "us") is committed to protecting the privacy of all users. We operate in full compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and Ontario's Consumer Reporting Act.\n\nInformation We Collect: When you register via Google Single Sign-On, we collect your name, email address, and profile photo. When you use the valuation tool or book a showing, we collect the address and contact information you provide.\n\nHow We Use Your Information: Your information is used to provide personalized property recommendations, facilitate communication between you and licensed real estate agents, and improve our services. We do not sell your personal information to third parties.\n\nData Retention: Your account data is retained for as long as your account is active. You may request deletion of your data at any time by contacting us.\n\nCookies: We use essential cookies for authentication and session management. We do not use third-party tracking cookies.\n\nContact: For privacy inquiries, contact Ali Abbas at ali@listingbooth.com or through the Contact Us page.`
  },
  terms: {
    title: 'Terms of Use',
    content: `By accessing ListingBooth.com, you agree to be bound by these Terms of Use. ListingBooth is operated by Ali Abbas, a licensed real estate salesperson with eXp Realty, Brokerage.\n\nAccuracy of Information: While we strive to ensure the accuracy of all listing data sourced from the CREA Data Distribution Facility (DDF®), we make no warranties regarding the completeness or accuracy of the information. Listing availability, pricing, and details are subject to change without notice.\n\nUser Conduct: Users agree not to scrape, reproduce, or redistribute listing data obtained through this platform. All MLS® data is subject to CREA's terms of use.\n\nIntellectual Property: The ListingBooth brand, BOOTHS.AI engine, and all associated software are proprietary. The trademarks MLS®, REALTOR®, and DDF® are owned by The Canadian Real Estate Association (CREA).\n\nLimitation of Liability: ListingBooth and its affiliates shall not be liable for any damages arising from the use of this platform, including but not limited to reliance on property valuations or listing data.`
  },
  accessibility: {
    title: 'Accessibility',
    content: `ListingBooth is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.\n\nConformance Status: We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. We are actively working to increase the accessibility and usability of our platform.\n\nMeasures We Take: We use semantic HTML5 elements, provide alternative text for all images, ensure sufficient color contrast ratios, support keyboard navigation, and test with screen readers.\n\nFeedback: If you encounter accessibility barriers on ListingBooth.com, please contact us at ali@listingbooth.com. We take accessibility feedback seriously and will respond within 5 business days.`
  },
  ddf: {
    title: 'DDF® Data Terms',
    content: `ListingBooth.com displays real estate listing data provided by the Canadian Real Estate Association (CREA) through the Data Distribution Facility (DDF®).\n\nData Attribution: All listing data displayed on this website is supplied by CREA and is subject to CREA's terms and conditions. The trademarks MLS®, Multiple Listing Service®, and the associated logos are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA.\n\nData Usage: The listing data displayed on this site is for informational purposes only and is not intended as a solicitation to buy or sell real estate. The data is updated regularly but may not reflect the most current listing information.\n\nAccuracy: While efforts are made to ensure accuracy, ListingBooth cannot guarantee that all information is current or complete. Buyers and sellers should independently verify all listing information before making any real estate decisions.\n\nCompliance: This website operates as a Virtual Office Website (VOW) in compliance with CREA's DDF® data distribution rules.`
  },
  vow: {
    title: 'VOW Agreement',
    content: `This website operates as a Virtual Office Website (VOW) in compliance with the rules established by the Canadian Real Estate Association (CREA) and the Real Estate Council of Ontario (RECO).\n\nRegistration Requirement: To access certain property data, including sold prices and detailed historical information, users must register and acknowledge receipt of the RECO Information Guide. This is a regulatory requirement, not a marketing decision.\n\nData Access Levels:\n• Unregistered Users: Can view active listings, photos, and basic property details.\n• Registered Users: Can access sold price data, price history, days on market analytics, and VOW-restricted fields.\n\nRECO Information Guide: By registering, you acknowledge that you have received the RECO Information Guide and understand your rights as a consumer in a real estate transaction in Ontario.\n\nBrokerage Disclosure: All real estate services facilitated through this platform are brokered by eXp Realty Canada, Brokerage. Ali Abbas is a licensed real estate salesperson operating under eXp Realty.`
  },
};

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = LEGAL_CONTENT[slug];

  if (!page) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#111' }}>404</h1>
          <p style={{ color: '#888' }}>This legal page doesn't exist.</p>
          <Link href="/" style={{ color: '#da291c', fontWeight: 700 }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ backgroundColor: '#111', padding: '120px 48px 48px', color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legal</p>
          <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 900, letterSpacing: '-1px' }}>{page.title}</h1>
        </div>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px', lineHeight: 1.8, fontSize: '15px', color: '#444' }}>
        {page.content.split('\n\n').map((para, i) => (
          <p key={i} style={{ margin: '0 0 24px' }}>{para}</p>
        ))}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888' }}>
          <p>Last updated: March 2026. Brokered by <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>.</p>
        </div>
      </div>
    </div>
  );
}
