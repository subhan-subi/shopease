import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './Components/header';
import { Mainpart } from './Components/hero';
import { Productfilter } from './Components/products';
import { Searchproduc } from './Components/searhproducts';
import { Productpage } from './Components/Productpage';
import { Flash } from './Components/flash';
import { SingleItempage } from './Components/SingleItempage';
import { ItemCart } from './Components/CARTPAGE';
import { Footer } from './Components/Footer';
import { Link } from 'react-router-dom';
import { Featured } from './Components/Featured';
import { Save } from './Components/form';
import { Fcategory } from './Components/Fcate';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Order } from './Components/order';
import { Slider } from './Components/slider';
import { Free } from './Components/Free';
import { Layout } from './Components/Layoout';
import { ProdctsArray } from './Components/PArray';
import { Cartprovider } from './Components/Usercontext';
import { useEffect, useState } from 'react';
import { Contact } from './Components/contact';
import { useContext } from 'react';
import { Addtocart } from './Components/Usercontext';
import { Wishlist } from './Components/wishlist';
import { AdminLayout } from "./admin/AdminLayout";
import { Dashboard } from './admin/AdminDashboard';
import { AddProducts } from './admin/AdminProducts';
import { AddCotegories } from './admin/AdminCotegories';
import { Addform } from './admin/productsform';
import { Adminorders } from './admin/Adminorder';
import { Ordersmange } from './admin/Ordersmange';
import AuthLayout from './auth/AuthLayout';
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import USerDashboard from './admin/UserDashboard';
import ProtectedRoute from "./Components/ProtectedRoute";
import { Adminreviews } from './admin/AdminReviews';
import { AdminProfile } from './admin/AdminProfile';
import { AdminEmailSettings } from './admin/AdminEmailSettings';
function App() {
  return (
    <Cartprovider>
      <div>
        <Routes>
          <Route path='/' element={
            <>
              <Layout>
                <Mainpart />
                <Fcategory />
                <Productpage limit={8} />
              </Layout>
              <div>
                <Flash />
                <Slider />
                <Free />
                <Save />
                <Footer />
              </div>
            </>
          } />

          <Route path='/Productpage' element={
            <div>
              <Layout>
                <Searchproduc />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path="/category/:cetegory/:subcategory?/:frsubcategory?" element={
            <div>
              <Layout>
                <Productfilter />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path='/ItemCart' element={
            <div>
              <Layout>
                <ItemCart />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path='/Wishlist' element={
            <div>
              <Layout>
                <Wishlist />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path='/product/:id' element={
            <div>
              <Layout>
                <SingleItempage />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path='/Order' element={
            <div>
              <Layout>
                <Order />
              </Layout>
              <Footer />
            </div>
          } />

          <Route path='/Contact' element={
            <div>
              <Layout>
                <Contact />
              </Layout>
              <Footer />
            </div>
          } />

          {/*------- ADMIN LAYOUT -------*/}
          <Route path='/admin' element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          } />

          <Route path='/Dashboard' element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path='/AddProducts' element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AddProducts />
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path='/AddCotegories' element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AddCotegories />
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path='/Addform' element={ <ProtectedRoute role="admin"><AdminLayout> <Addform /> </AdminLayout></ProtectedRoute>} />
          <Route path='/Addform/:id' element={ <ProtectedRoute role="admin"><AdminLayout> <Addform /> </AdminLayout></ProtectedRoute>} />
          <Route path='/Adminorders' element={ <ProtectedRoute role="admin"><AdminLayout> <Adminorders /> </AdminLayout></ProtectedRoute>} />
          <Route path='/Ordersmange/:id' element={ <ProtectedRoute role="admin"><AdminLayout> <Ordersmange /> </AdminLayout></ProtectedRoute>} />
          <Route path='/Adminreviews' element={<ProtectedRoute role="admin"><AdminLayout> <Adminreviews /> </AdminLayout></ProtectedRoute>}></Route>
          {/* AUTH & USER */}
          <Route path='/Login' element={<AuthLayout> <Login /> </AuthLayout>} />
          <Route path='/Signup' element={<AuthLayout><Signup /></AuthLayout>} />
          <Route path='/forgot-password' element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path='/reset-password/:token' element={<AuthLayout><ResetPassword /></AuthLayout>} />
          <Route path='/UserDashboard' element={
            <ProtectedRoute role="customer">
              <USerDashboard />
            </ProtectedRoute>
          } />
          <Route path='/AdminProfile' element={
            <ProtectedRoute role="admin">
              <AdminLayout><AdminProfile /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path='/AdminEmailSettings' element={
            <ProtectedRoute role="admin">
              <AdminLayout><AdminEmailSettings /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path='/admin/verify-email-change' element={<AdminEmailSettings />} />
        </Routes>

        <ToastContainer position='top-right' autoClose={3000} theme='dark' />
      </div>
    </Cartprovider>
  );
}

export default App;