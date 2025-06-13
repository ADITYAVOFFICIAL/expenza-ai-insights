import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have this for long content

const Tos: React.FC = () => {
  const lastUpdated = "October 26, 2023"; // Example date

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex justify-center">
      <ScrollArea className="w-full max-w-4xl h-[calc(100vh-4rem)]">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground text-center">Last Updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none">
            <p>
              Welcome to DigiSamahārta ("us", "we", or "our"). These Terms of Service ("Terms") govern your use of our
              web application (the "Service") accessible at [Your App URL] and any related services provided by DigiSamahārta.
            </p>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of
              the terms, then you may not access the Service.
            </p>

            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the Service, you affirm that you are at least 18 years old or have reached the age
              of majority in your jurisdiction, and are fully able and competent to enter into the terms, conditions, obligations,
              affirmations, representations, and warranties set forth in these Terms, and to abide by and comply with these Terms.
            </p>

            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p>
              DigiSamahārta is a personal finance management application designed to help users track expenses, manage budgets,
              set financial goals, and gain insights into their financial habits. The Service may include features such as
              transaction logging, budget creation, financial reporting, and AI-powered insights (collectively, the "Features").
            </p>

            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during the registration process.</li>
              <li>Maintain and promptly update your account information to keep it accurate, current, and complete.</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
              <li>Notify us immediately if you discover or otherwise suspect any security breaches related to the Service or your account.</li>
            </ul>
            <p>
              You are responsible for all activities that occur under your account, whether or not you know about them.
            </p>

            <h2 className="text-xl font-semibold">4. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate DigiSamahārta, a DigiSamahārta employee, another user, or any other person or entity.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm DigiSamahārta or users of the Service or expose them to liability.</li>
            </ul>

            <h2 className="text-xl font-semibold">5. Intellectual Property Rights</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will
              remain the exclusive property of DigiSamahārta and its licensors. The Service is protected by copyright, trademark,
              and other laws of both [Your Country] and foreign countries. Our trademarks and trade dress may not be used in
              connection with any product or service without the prior written consent of DigiSamahārta.
            </p>

            <h2 className="text-xl font-semibold">6. User Content</h2>
            <p>
              You are solely responsible for all data, information, and other content ("User Content") that you upload, post,
              input, provide, or submit to the Service. You retain ownership of your User Content. By providing User Content,
              you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce,
              distribute, prepare derivative works of, display, and perform the User Content in connection with the Service and
              our business, including for promoting and redistributing part or all of the Service.
            </p>

            <h2 className="text-xl font-semibold">7. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or
              liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited
              to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </p>

            <h2 className="text-xl font-semibold">8. Disclaimers</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DigiSamahārta makes no representations or warranties
              of any kind, express or implied, as to the operation of their services, or the information, content, or materials
              included therein. You expressly agree that your use of these services, their content, and any services or items
              obtained from us is at your sole risk.
            </p>
            <p>
              Neither DigiSamahārta nor any person associated with DigiSamahārta makes any warranty or representation with respect
              to the completeness, security, reliability, quality, accuracy, or availability of the services.
            </p>

            <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
            <p>
              Except as prohibited by law, you will hold us and our officers, directors, employees, and agents harmless for
              any indirect, punitive, special, incidental, or consequential damage, however it arises (including attorneys' fees
              and all related costs and expenses of litigation and arbitration), whether in an action of contract, negligence,
              or other tortious action, or arising out of or in connection with this agreement, including without limitation
              any claim for personal injury or property damage, arising from this agreement and any violation by you of any
              federal, state, or local laws, statutes, rules, or regulations, even if company has been previously advised of
              the possibility of such damage.
            </p>

            <h2 className="text-xl font-semibold">10. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction/Country], without regard
              to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold">11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
              material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
              material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the
              revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>

            <h2 className="text-xl font-semibold">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: [Your Contact Email or Link to Contact Page].
              You can also reach out through our <Link to="/support" className="text-primary hover:underline">support page</Link>.
            </p>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default Tos;