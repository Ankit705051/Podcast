import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI, planAPI } from '../services/api';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  Star,
  Zap,
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

const Subscription = () => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Get user subscription
      let subscription = null;
      try {
        const subscriptionResponse = await subscriptionAPI.getUserSubscription();
        subscription = subscriptionResponse.data.subscription;
      } catch (error) {
        // If no subscription found, that's okay
        if (error.response?.status !== 404) {
          console.error('Error fetching subscription:', error);
        }
      }

      // Get all plans
      let plansData = [];
      try {
        const plansResponse = await planAPI.getAllPlans();
        plansData = plansResponse.data.plans || plansResponse.data || [];
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load available plans');
      }

      setCurrentSubscription(subscription);
      setPlans(plansData);
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFreeSubscription = async () => {
    try {
      const response = await subscriptionAPI.createFree(user._id);
      setCurrentSubscription(response.data.subscription);
      toast.success('Free subscription activated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  const handleUpgradeSubscription = async (planId) => {
    setUpgrading(true);
    try {
      const response = await subscriptionAPI.createStripeCheckout({ planId });
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate upgrade');
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'pending_payment':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'pending_payment':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your podcast subscription and billing</p>
        </div>

        {/* Current Subscription */}
        {currentSubscription ? (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                {getStatusIcon(currentSubscription.status)}
                <span className="ml-1 capitalize">{currentSubscription.status.replace('_', ' ')}</span>
              </span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  {getPlanIcon(currentSubscription.plan?.name)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold text-gray-900">{currentSubscription.plan?.name || 'Free'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="font-semibold text-gray-900">
                  {currentSubscription.endDate 
                    ? new Date(currentSubscription.endDate).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="font-semibold text-gray-900">
                  ${currentSubscription.amount || 0}
                </p>
              </div>
            </div>

            {currentSubscription.status === 'active' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Handle cancellation logic
                    toast.info('Cancellation feature coming soon!');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card mb-8 bg-yellow-50 border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
                <p className="text-gray-600">You don't have an active subscription. Get started with our free plan!</p>
              </div>
              <button
                onClick={handleCreateFreeSubscription}
                className="btn btn-primary"
              >
                Activate Free Plan
              </button>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan?._id === plan._id;
              const isUpgrade = currentSubscription && plan.price > (currentSubscription.plan?.price || 0);
              
              return (
                <div
                  key={plan._id}
                  className={`card relative ${
                    plan.name === 'Premium' ? 'border-primary-500 ring-2 ring-primary-200' : ''
                  }`}
                >
                  {plan.name === 'Premium' && (
                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.duration} days</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{plan.storage_quota_mb}MB storage</span>
                      </li>
                      {plan.max_podcasts && (
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{plan.max_podcasts} max podcasts</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgradeSubscription(plan._id)}
                    disabled={isCurrentPlan || upgrading}
                    className={`w-full btn ${
                      isCurrentPlan
                        ? 'btn-secondary cursor-not-allowed'
                        : 'btn-primary'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {upgrading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : isUpgrade ? (
                      <span className="flex items-center justify-center">
                        Upgrade
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    ) : (
                      'Choose Plan'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
          <div className="card">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No billing history available</p>
              <p className="text-sm text-gray-500 mt-2">
                Your payment history will appear here once you have an active subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
