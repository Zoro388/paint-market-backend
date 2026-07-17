import HeroSlider from "../models/HeroSlider.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadBuffer, deleteFile } from "../utils/cloudinaryUpload.js";

/*
|--------------------------------------------------------------------------
| CREATE HERO SLIDE
|--------------------------------------------------------------------------
*/

export const createHeroSlide = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    displayOrder,
  } = req.body;

  const image = req.file;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required.",
    });
  }

  if (!image) {
    return res.status(400).json({
      success: false,
      message: "Hero image is required.",
    });
  }

  const uploadedImage = await uploadBuffer(
    image,
    "paintmarket/hero-slider"
  );

  const hero = await HeroSlider.create({
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    displayOrder,
    image: {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Hero slide created successfully.",
    hero,
  });
});

/*
|--------------------------------------------------------------------------
| PUBLIC - GET ACTIVE HERO SLIDES
|--------------------------------------------------------------------------
*/

export const getHeroSlides = asyncHandler(async (req, res) => {
  const heroes = await HeroSlider.find({
    isActive: true,
  }).sort({
    displayOrder: 1,
  });

  return res.status(200).json({
    success: true,
    count: heroes.length,
    heroes,
  });
});

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL HERO SLIDES
|--------------------------------------------------------------------------
*/

export const getAdminHeroSlides = asyncHandler(async (req, res) => {
  const heroes = await HeroSlider.find().sort({
    displayOrder: 1,
  });

  return res.status(200).json({
    success: true,
    count: heroes.length,
    heroes,
  });
});

/*
|--------------------------------------------------------------------------
| GET HERO BY ID
|--------------------------------------------------------------------------
*/

export const getHeroSlide = asyncHandler(async (req, res) => {
  const hero = await HeroSlider.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      message: "Hero slide not found.",
    });
  }

  return res.status(200).json({
    success: true,
    hero,
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE HERO SLIDE
|--------------------------------------------------------------------------
*/

export const updateHeroSlide = asyncHandler(async (req, res) => {
  const hero = await HeroSlider.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      message: "Hero slide not found.",
    });
  }

  if (req.file) {
    if (hero.image?.publicId) {
      await deleteFile(hero.image.publicId);
    }

    const uploadedImage = await uploadBuffer(
      req.file,
      "paintmarket/hero-slider"
    );

    hero.image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };
  }

  hero.title = req.body.title ?? hero.title;
  hero.subtitle = req.body.subtitle ?? hero.subtitle;
  hero.description = req.body.description ?? hero.description;
  hero.buttonText = req.body.buttonText ?? hero.buttonText;
  hero.buttonLink = req.body.buttonLink ?? hero.buttonLink;
  hero.displayOrder =
    req.body.displayOrder ?? hero.displayOrder;

  await hero.save();

  return res.status(200).json({
    success: true,
    message: "Hero slide updated successfully.",
    hero,
  });
});

/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE STATUS
|--------------------------------------------------------------------------
*/

export const toggleHeroStatus = asyncHandler(async (req, res) => {
  const hero = await HeroSlider.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      message: "Hero slide not found.",
    });
  }

  hero.isActive = !hero.isActive;

  await hero.save();

  return res.status(200).json({
    success: true,
    message: `Hero slide ${
      hero.isActive ? "activated" : "deactivated"
    } successfully.`,
    hero,
  });
});

/*
|--------------------------------------------------------------------------
| DELETE HERO SLIDE
|--------------------------------------------------------------------------
*/

export const deleteHeroSlide = asyncHandler(async (req, res) => {
  const hero = await HeroSlider.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      message: "Hero slide not found.",
    });
  }

  if (hero.image?.publicId) {
    await deleteFile(hero.image.publicId);
  }

  await hero.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Hero slide deleted successfully.",
  });
});