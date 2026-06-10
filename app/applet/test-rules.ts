import fs from 'fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

async function runTests() {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-vectura-test',
    firestore: { rules },
  });

  try {
    const unauthed = testEnv.unauthenticatedContext();
    const userDb = testEnv.authenticatedContext('user_123', { email: 'user@test.com', email_verified: true }).firestore();
    const adminDb = testEnv.authenticatedContext('admin_456', { email: 'franklinmotos2023@gmail.com', email_verified: true }).firestore();

    const check = async (name, promise) => {
        try {
            await promise;
            console.log(`✅ ${name}`);
        } catch (e) {
            console.error(`❌ ${name}: ${e.message}`);
        }
    };

    await check("Unauthed get motos", getDocs(collection(unauthed.firestore(), 'motos')));
    await check("Unauthed get acessorios", getDocs(collection(unauthed.firestore(), 'acessorios')));
    await check("Unauthed get settings/acessoriosConfig", getDoc(doc(unauthed.firestore(), 'settings/acessoriosConfig')));
    await check("Unauthed get settings/theme", getDoc(doc(unauthed.firestore(), 'settings/theme')));

    await check("Admin read user user_123", getDoc(doc(adminDb, 'users/user_123')));
    await check("User read own user", getDoc(doc(userDb, 'users/user_123')));
    
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user_123'), {
        uid: 'user_123', email: 'user@test.com', role: 'user'
      });
    });

    await check("User update own profile", setDoc(doc(userDb, 'users/user_123'), { nome: 'Test' }, { merge: true }));
    
  } catch (e) {
    console.error("Test execution failed: ", e);
  } finally {
    await testEnv.cleanup();
  }
}
runTests();
