import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | GENERAL
    |--------------------------------------------------------------------------
    */

    siteName: {
      type: String,
      default: "Paint Domain",
    },

    siteDescription: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    favicon: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | APPEARANCE
    |--------------------------------------------------------------------------
    */

    primaryColor: {
      type: String,
      default: "#D4AF78",
    },

    secondaryColor: {
      type: String,
      default: "#0A2E63",
    },

    buttonColor: {
      type: String,
      default: "#D4AF78",
    },

    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },

    textColor: {
      type: String,
      default: "#222222",
    },

    footerColor: {
      type: String,
      default: "#0A2E63",
    },

    /*
    |--------------------------------------------------------------------------
    | HERO
    |--------------------------------------------------------------------------
    */

    heroTitle: {
      type: String,
      default: "",
    },

    heroSubtitle: {
      type: String,
      default: "",
    },

    heroButtonText: {
      type: String,
      default: "",
    },

    heroButtonLink: {
      type: String,
      default: "",
    },

    heroImage: {
      type: String,
      default: "",
    },

    heroBanner: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | ABOUT
    |--------------------------------------------------------------------------
    */

    aboutTitle: {
      type: String,
      default: "",
    },

    aboutDescription: {
      type: String,
      default: "",
    },

    aboutImage: {
      type: String,
      default: "",
    },

    aboutBanner: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SHOP
    |--------------------------------------------------------------------------
    */

    shopTitle: {
      type: String,
      default: "",
    },

    shopDescription: {
      type: String,
      default: "",
    },

    shopBanner: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | NEWSLETTER
    |--------------------------------------------------------------------------
    */

    newsletterTitle: {
      type: String,
      default: "",
    },

    newsletterSubtitle: {
      type: String,
      default: "",
    },

    newsletterBanner: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | CONTACT
    |--------------------------------------------------------------------------
    */

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    workingHours: {
      type: String,
      default: "",
    },

    contactBanner: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SOCIALS
    |--------------------------------------------------------------------------
    */

    facebook: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    youtube: {
      type: String,
      default: "",
    },

    tiktok: {
      type: String,
      default: "",
    },

    twitter: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    footerLogo: {
      type: String,
      default: "",
    },

    footerDescription: {
      type: String,
      default: "",
    },

    copyright: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    metaKeywords: {
      type: String,
      default: "",
    },

    ogImage: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | FEATURES
    |--------------------------------------------------------------------------
    */

    showTestimonials: {
      type: Boolean,
      default: true,
    },

    showGallery: {
      type: Boolean,
      default: true,
    },

    showPortfolio: {
      type: Boolean,
      default: true,
    },

    showNewsletter: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "SiteSettings",
  siteSettingsSchema
);