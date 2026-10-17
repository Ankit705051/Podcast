import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Mic, 
  Users, 
  HeadphonesIcon, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Mic,
      title: 'Create Podcasts',
      description: 'Record, edit, and publish your own podcasts with our professional studio tools.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Discover Content',
      description: 'Explore thousands of podcasts across various genres and discover new creators.',
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Connect with listeners and other podcast creators to grow your audience.',
    },
    {
      icon: Star,
      title: 'Premium Features',
      description: 'Unlock advanced analytics, unlimited storage, and exclusive content tools.',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Podcasts Created', value: '5K+' },
    { label: 'Hours of Content', value: '50K+' },
    { label: 'Countries Reached', value: '100+' },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Upload up to 3 hours per month',
        'Basic analytics',
        'Community support',
        'Standard quality audio',
      ],
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      features: [
        'Unlimited uploads',
        'Advanced analytics',
        'Priority support',
        'HD quality audio',
        'Custom branding',
        'Monetization tools',
      ],
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '$29.99',
      features: [
        'Everything in Premium',
        'White-label solution',
        'API access',
        'Dedicated account manager',
        'Advanced monetization',
        'Live streaming',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Voice,
              <span className="text-primary-600"> Your Podcast</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, share, and monetize your podcasts with the most comprehensive platform 
              built for creators by creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/studio"
                    className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Creating
                  </Link>
                  <Link
                    to="/podcasts"
                    className="btn btn-secondary text-lg px-8 py-3 flex items-center justify-center"
                  >
                    <HeadphonesIcon className="mr-2 h-5 w-5" />
                    Browse Podcasts
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/podcasts"
                    className="btn btn-secondary text-lg px-8 py-3 flex items-center justify-center"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Explore Content
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <div>
        <button></button>
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional tools and features designed to help you create amazing podcasts 
              and grow your audience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start for free and upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card relative ${
                  plan.highlighted
                    ? 'border-2 border-primary-500 shadow-xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-lg text-gray-600 font-normal">
                      {plan.price !== '$0' ? '/month' : ''}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={isAuthenticated ? '/subscription' : '/register'}
                  className={`w-full btn ${
                    plan.highlighted ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Podcast Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of creators who are already sharing their voice with the world.
          </p>
          <Link
            to={isAuthenticated ? '/studio' : '/register'}
            className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            {isAuthenticated ? 'Go to Studio' : 'Start Free Today'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
