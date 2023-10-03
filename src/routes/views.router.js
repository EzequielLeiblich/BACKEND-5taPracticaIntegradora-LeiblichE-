import { Router } from 'express';
import passport from 'passport';
import { rolesMiddlewareAdmin, rolesMiddlewareUserPremium } from "./middlewares/roles.middleware.js";
const viewsRouter = Router();

viewsRouter.get('/', (req, res) => {
  res.render('products', {
    title: 'Productos'
  })
});

viewsRouter.get('/products', (req, res) => {
  res.render('products', {
    title: 'Productos'
  })
});

viewsRouter.get('/cart', (req, res) => {
  res.render('cart', {
    title: 'Carrito'
  });
});

viewsRouter.get('/chat', (req, res) => {
  res.render('chat', {
    title: 'Chat'
  })
});

viewsRouter.get('/register', (req, res) => {
  res.render('register', {
    title: 'Registro'
  });
});

viewsRouter.get('/login', (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión'
  });
});

viewsRouter.get('/completeProfile', (req, res) => {
  res.render('extraForm', {
    title: 'Formulario'
  })
});

viewsRouter.get('/requestResetPassword', (req, res) => {
  res.render('requestResetPassword', {
    title: 'Restablecer Contraseña - Solicitar Correo'
  })
})

viewsRouter.get('/resetPassword', passport.authenticate('jwtResetPass', {
  session: false,
  failureRedirect: '/requestResetPassword'
}), (req, res) => {
  res.render('resetPassword', {
    title: 'Restablecer Contraseña'
  })
})

viewsRouter.get('/adminPanel', passport.authenticate('jwt', {
  session: false
}), rolesMiddlewareAdmin, (req, res) => {
  res.render('userAdmin', {
    title: 'Panel de administrador'
  })
})

viewsRouter.get('/premiumView', passport.authenticate('jwt', {
  session: false
}), rolesMiddlewareUserPremium, (req, res) => {
  res.render('userPremium', {
    title: 'Premium View'
  })
})

export default viewsRouter;