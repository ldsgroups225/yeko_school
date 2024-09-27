export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'fr',
    messages: {
        en: {
            welcome: 'Welcome',
            email: 'Email',
            enterEmail: 'Enter your email',
            password: 'Password',
            enterPassword: 'Enter your password',
            rememberMe: 'Remember me',
            emailRequired: 'Email is required',
            passwordRequired: 'Password is required',
            continueWithGitHub: 'Continue with GitHub',
            welcomeBack: 'Welcome back!',
            noAccount: "Don't have an account?",
            signUp: 'Sign up',
            forgotPassword: 'Forgot password?',
            errorSigningIn: 'Error signing in',
            bySigningIn: 'By signing in, you agree to our',
            termsOfService: 'Terms of Service'
        },
        fr: {
            welcome: 'Bienvenue',
            email: 'Email',
            enterEmail: 'Entrez votre email',
            password: 'Mot de passe',
            enterPassword: 'Entrez votre mot de passe',
            rememberMe: 'Se souvenir de moi',
            emailRequired: "L'email est requis",
            passwordRequired: 'Le mot de passe est requis',
            continueWithGitHub: 'Continuer avec GitHub',
            welcomeBack: 'Bon retour parmi nous !',
            noAccount: "Vous n'avez pas de compte ?",
            signUp: "S'inscrire",
            forgotPassword: 'Mot de passe oublié ?',
            errorSigningIn: 'Erreur de connexion',
            bySigningIn: 'En vous connectant, vous acceptez nos',
            termsOfService: "Conditions d'utilisation"
        }
    }
}))