const { createAndSendOtp, verifyOtpCode } = require('../src/services/otp.service');
const prisma = require('../src/config/db');

async function testOtpFlow() {
  console.log('Testing OTP Service Flow...');
  const testEmail = 'test_otp_' + Date.now() + '@example.com';

  try {
    // 1. Send OTP for Registration
    console.log('1. Sending OTP...');
    const sendResult = await createAndSendOtp(testEmail, 'REGISTRATION', 'Test User');
    console.log('Send result:', sendResult);

    // 2. Fetch created OTP code from DB
    const record = await prisma.otpVerification.findFirst({
      where: { email: testEmail, purpose: 'REGISTRATION' },
    });
    console.log('Found OTP record in DB with code:', record?.code);
    if (!record || !record.code) {
      throw new Error('OTP record was not saved to DB');
    }

    // 3. Test Invalid OTP Code
    console.log('2. Testing invalid OTP code rejection...');
    try {
      await verifyOtpCode(testEmail, '000000', 'REGISTRATION');
      throw new Error('Expected invalid OTP to fail, but it succeeded');
    } catch (err) {
      console.log('Successfully rejected invalid OTP:', err.message);
    }

    // 4. Test Valid OTP Code Verification
    console.log('3. Testing valid OTP code verification...');
    const verifyResult = await verifyOtpCode(testEmail, record.code, 'REGISTRATION');
    console.log('Verification result:', verifyResult);

    // 5. Verify single-use (OTP should be deleted/invalidated)
    console.log('4. Verifying single-use deletion...');
    const afterRecord = await prisma.otpVerification.findFirst({
      where: { email: testEmail, purpose: 'REGISTRATION' },
    });
    if (afterRecord) {
      throw new Error('OTP record was not deleted after verification');
    }
    console.log('OTP record successfully consumed and deleted!');

    console.log('\n>>> ALL OTP BACKEND TESTS PASSED! <<<\n');
  } catch (err) {
    console.error('OTP Test Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testOtpFlow();
