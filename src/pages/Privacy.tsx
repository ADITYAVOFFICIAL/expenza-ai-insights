import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have this for long content

const Privacy: React.FC = () => {
  const lastUpdated = "October 26, 2023"; // Example date

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex justify-center">
      <ScrollArea className="w-full max-w-4xl h-[calc(100vh-4rem)]">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none">
            <p>
              DigiSamahārta ("us", "we", or "our") operates the DigiSamahārta web application (the "Service"). This page
              informs you of our policies regarding the collection, use, and disclosure of personal data when you use our
              Service and the choices you have associated with that data.
            </p>
            <p>
              We use your data to provide and improve the Service. By using the Service, you agree to the collection and use
              of information in accordance with this policy.
            </p>

            <h2 className="text-xl font-semibold">1. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>

            <h3 className="text-lg font-medium">Types of Data Collected</h3>
            <h4>Personal Data</h4>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can
              be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not
              limited to:
            </p>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Financial information (such as transaction details, account balances, budget information, income, expenses, goals - all entered by you)</li>
              <li>Usage Data (e.g., IP address, browser type, pages visited)</li>
              <li>Cookies and Similar Technologies</li>
            </ul>

            <h4>Financial Data</h4>
            <p>
              DigiSamahārta is a financial management tool. As such, the core functionality involves you inputting financial data. This includes:
            </p>
            <ul>
              <li>Transaction details (amount, date, category, description, payment method, bank name)</li>
              <li>Budget information (categories, limits)</li>
              <li>Financial goals (target amounts, deadlines)</li>
              <li>Allowance details (amount, frequency, source)</li>
              <li>Recurring expenses</li>
            </ul>
            <p>
              This financial data is essential for the Service to function. We treat this data with the utmost sensitivity and security.
              We do not access your bank accounts directly or store your bank login credentials. All financial data is provided by you manually or through secure, user-authorized connections if such features are implemented in the future (e.g., Plaid).
            </p>

            <h4>Usage Data</h4>
            <p>
              We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may
              include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser
              version, the pages of our Service that you visit, the time and date of your visit, the time spent on those
              pages, unique device identifiers and other diagnostic data.
            </p>

            <h4>Tracking & Cookies Data</h4>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain
              information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
              you do not accept cookies, you may not be able to use some portions of our Service.
            </p>

            <h2 className="text-xl font-semibold">2. Use of Data</h2>
            <p>DigiSamahārta uses the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide you with AI-powered insights and financial summaries (if applicable)</li>
            </ul>

            <h2 className="text-xl font-semibold">3. Data Storage and Security</h2>
            <p>
              The security of your data is important to us. We store your data on secure servers, potentially using cloud providers
              like Appwrite or similar services, which employ industry-standard security measures. We strive to use commercially
              acceptable means to protect your Personal Data, including encryption of data at rest and in transit.
            </p>
            <p>
              However, remember that no method of transmission over the Internet, or method of electronic storage is 100%
              secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot
              guarantee its absolute security.
            </p>

            <h2 className="text-xl font-semibold">4. Data Retention</h2>
            <p>
              We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy
              Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations
              (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and
              enforce our legal agreements and policies.
            </p>
            <p>
              Usage Data is generally retained for a shorter period, except when this data is used to strengthen the security
              or to improve the functionality of our Service, or we are legally obligated to retain this data for longer
              time periods.
            </p>

            <h2 className="text-xl font-semibold">5. Disclosure of Data</h2>
            <p>We may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
            <ul>
              <li>To comply with a legal obligation</li>
              <li>To protect and defend the rights or property of DigiSamahārta</li>
              <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>To protect the personal safety of users of the Service or the public</li>
              <li>To protect against legal liability</li>
            </ul>
            <p>
              We do not sell your Personal Data to third parties.
            </p>

            <h2 className="text-xl font-semibold">6. Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have certain data protection rights. DigiSamahārta aims to take reasonable
              steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
            </p>
            <ul>
              <li><strong>The right to access, update or delete</strong> the information we have on you. You can access, update or request deletion of your Personal Data directly within your account settings section or by contacting us.</li>
              <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
              <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
              <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
              <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
              <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where DigiSamahārta relied on your consent to process your personal information.</li>
            </ul>
            <p>Please note that we may ask you to verify your identity before responding to such requests.</p>

            <h2 className="text-xl font-semibold">7. Service Providers</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide
              the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
              These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated
              not to disclose or use it for any other purpose. (e.g., hosting providers, analytics services).
            </p>

            <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally
              identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware
              that your Child has provided us with Personal Data, please contact us. If we become aware that we have
              collected Personal Data from children without verification of parental consent, we take steps to remove that
              information from our servers.
            </p>

            <h2 className="text-xl font-semibold">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy
              Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the
              change becoming effective and update the "last updated" date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
              effective when they are posted on this page.
            </p>

            <h2 className="text-xl font-semibold">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>By email: admin@digisamaharta.vercel.app</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default Privacy;