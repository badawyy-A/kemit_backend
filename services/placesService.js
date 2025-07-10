const Place = require("../models/placesModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");

const HandlerFactory = require("./handlerFactory");

const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 600 }); // كاش لمدة 10 دقايق

// exports.getNearbyPlaces = asyncHandler(async (req, res) => {
//   const apiKey = process.env.GEOAPIFY_API_KEY;
//   const baseUrl = "https://api.geoapify.com/v2/places";
//   const { lng, lat } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ message: "Latitude و Longitude مطلوبين." });
//   }

//   const cacheKey = `${lat}-${lng}`;
//   const cachedData = cache.get(cacheKey);

//   if (cachedData) {
//     return res.status(200).json(cachedData);
//   }

//   // الفئات المعدّلة
//   const placeTypes = {
//     Hospitals: "healthcare.hospital,healthcare.clinic_or_praxis",
//     Transportation: "public_transport",
//     Historical: "tourism.sights",
//     Souvenir: "commercial.gift_and_souvenir",
//     Museums: "entertainment.museum",
//     Entertainment: "entertainment",
//     Hotels: "accommodation.hotel",
//     Restaurants: "catering.restaurant",
//     Beaches: "beach",
//   };

//   try {
//     const requests = Object.values(placeTypes).map((category) =>
//       axios.get(
//         `${baseUrl}?categories=${category}&filter=circle:${lng},${lat},10000&limit=20&apiKey=${apiKey}`
//       )
//     );

//     const responses = await Promise.all(requests);
//     const allPlaces = responses.flatMap(
//       (response) => response.data.features || []
//     );

//     if (allPlaces.length === 0) {
//       return res.status(404).json({ message: "ما لقيناش أماكن قريبة." });
//     }

//     const results = {
//       totalResults: allPlaces.length,
//       data: allPlaces.map((place) => ({
//         name: place.properties.name || "غير معروف",
//         description: place.properties.description || "ما فيش وصف متوفر",
//         city:
//           place.properties.city ||
//           place.properties.address?.city ||
//           "غير معروف",
//         location: place.properties.formatted || "غير متوفر",
//         entryFee: 0, // Geoapify مش بيدي التكلفة
//         rating: place.properties.rating || 0,
//         images: "غير متوفر", // Geoapify مش بيدي صور
//         openingTime: place.properties.opening_hours
//           ? new Date() // لو في مواعيد افتتاح
//           : new Date(),
//         closingTime: place.properties.opening_hours
//           ? new Date() // لو في مواعيد إغلاق
//           : new Date(),
//         isPopular: false, // ممكن تضيف لوجيك للشهرة
//         category:
//           Object.keys(placeTypes).find((key) =>
//             place.properties.categories.some((cat) =>
//               placeTypes[key].split(",").includes(cat)
//             )
//           ) || "غير معروف",
//         position: {
//           lat: place.properties.lat,
//           lng: place.properties.lon,
//         },
//         distance: place.properties.distance || "غير متوفر",
//       })),
//     };

//     // // حفظ الأماكن في MongoDB
//     // const Place = require("../models/Place");
//     // await Place.insertMany(
//     //   results.data.map((place) => ({
//     //     name: place.name,
//     //     description: place.description,
//     //     city: place.city,
//     //     location: place.location,
//     //     entryFee: place.entryFee,
//     //     rating: place.rating,
//     //     images: place.images,
//     //     openingTime: place.openingTime,
//     //     closingTime: place.closingTime,
//     //     isPopular: place.isPopular,
//     //     category: place.category,
//     //   }))
//     // );

//     cache.set(cacheKey, results);
//     res.status(200).json(results);
//   } catch (error) {
//     console.error(
//       "خطأ في جلب البيانات:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({
//       message: error.response
//         ? error.response.data
//         : "حصل خطأ أثناء جلب البيانات.",
//     });
//   }
// });

// const axios = require("axios");
// const asyncHandler = require("express-async-handler");

exports.getNearbyPlaces = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "مطلوب lat و lng" });
  }

  const categories = {
    Hotels: "hotels",
    Restaurants: "restaurants",
    Beaches: "attractions",
  };

  const allPlaces = [];

  try {
    for (const [label, endpoint] of Object.entries(categories)) {
      const url = `https://travel-advisor.p.rapidapi.com/${endpoint}/list-by-latlng`;

      const options = {
        method: "GET",
        url,
        params: {
          latitude: lat,
          longitude: lng,
          limit: "50",
          currency: "USD",
          distance: "20",
          lunit: "km",
          lang: "en_US",
        },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      const places = response.data.data?.filter((p) => p.name) || [];

      const formatted = places.map((place) => ({
        name: place.name || "غير معروف",
        description: place.description || "ما فيش وصف متوفر",
        city: place.address_obj?.city || "غير معروف",
        location: place.address_obj?.address_string || "غير متوفر",
        entryFee: 0,
        rating: place.rating || 0,
        images: place.photo?.images?.large?.url || "غير متوفر",
        openingTime:
          place.hours?.week_ranges?.[0]?.[0]?.open_time || "غير معروف",
        closingTime:
          place.hours?.week_ranges?.[0]?.[0]?.close_time || "غير معروف",
        isPopular: Number(place.num_reviews || 0) > 100,
        category: place.category?.key || label,
        position: {
          lat: place.latitude,
          lng: place.longitude,
        },
        distance: place.distance || "غير متوفر",
      }));

      allPlaces.push(...formatted);
    }

    res.status(200).json({ data: allPlaces });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ message: "حصل خطأ أثناء جلب البيانات." });
  }
});

// exports.getNearbyPlaces = asyncHandler(async (req, res) => {
//   const { lat, lng } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ message: "مطلوب lat و lng" });
//   }

//   const categories = {
//     // Hospitals: "healthcare",
//     // Transportation: "transport",
//     // Historical: "attractions",
//     // Souvenir: "shops",
//     // Museums: "attractions",
//     // Entertainment: "attractions",
//     Hotels: "hotels",
//     Restaurants: "restaurants",
//     Beaches: "attractions",
//   };

//   const results = {};

//   try {
//     for (const [label, endpoint] of Object.entries(categories)) {
//       const url = `https://travel-advisor.p.rapidapi.com/${endpoint}/list-by-latlng`;

//       const options = {
//         method: "GET",
//         url,
//         params: {
//           latitude: lat,
//           longitude: lng,
//           limit: "50",
//           currency: "USD",
//           distance: "20",
//           lunit: "km",
//           lang: "en_US",
//         },
//         headers: {
//           "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
//           "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
//         },
//       };

//       const response = await axios.request(options);
//       const places = response.data.data?.filter((p) => p.name) || [];

//       results[label] = places.map((place) => ({
//         name: place.name || "غير معروف",
//         description: place.description || "ما فيش وصف متوفر",
//         city: place.address_obj?.city || "غير معروف",
//         location: place.address_obj?.address_string || "غير متوفر",
//         entryFee: 0, // مش متاح من API
//         rating: place.rating || 0,
//         images: place.photo?.images?.large?.url || "غير متوفر",
//         openingTime:
//           place.hours?.week_ranges?.[0]?.[0]?.open_time || "غير معروف",
//         closingTime:
//           place.hours?.week_ranges?.[0]?.[0]?.close_time || "غير معروف",
//         isPopular: Number(place.num_reviews || 0) > 100,
//         category: place.category?.key || label,
//         position: {
//           lat: place.latitude,
//           lng: place.longitude,
//         },
//         distance: place.distance || "غير متوفر",
//       }));
//     }

//     res.status(200).json(results);
//   } catch (error) {
//     console.error("API Error:", error.message);
//     res.status(500).json({ message: "حصل خطأ أثناء جلب البيانات." });
//   }
// });

// exports.getNearbyPlaces = asyncHandler(async (req, res) => {
//   const { lat, lng } = req.query;
//   const apiKey = process.env.GEOAPIFY_API_KEY;

//   if (!lat || !lng) {
//     return res
//       .status(400)
//       .json({ message: "Latitude و Longitude مطلوبين." });
//   }

//   const category = encodeURIComponent(
//     "healthcare.hospital,healthcare.clinic_or_praxis,healthcare.pharmacy,healthcare.dentist"
//   );

//   const baseUrl = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lng},${lat},50000&apiKey=${apiKey}`;

//   try {
//     const allPlaces = await fetchAllPlaces(baseUrl);

//     if (!allPlaces.length) {
//       return res.status(404).json({ message: "لا يوجد أماكن طبية قريبة." });
//     }

//     const results = allPlaces.map((place) => ({
//       name: place.properties.name || "غير معروف",
//       description: place.properties.description || "ما فيش وصف متوفر",
//       city:
//         place.properties.city ||
//         place.properties.address?.city ||
//         "غير معروف",
//       location: place.properties.formatted || "غير متوفر",
//       entryFee: 0,
//       rating: place.properties.rating || 0,
//       images: "غير متوفر",
//       openingTime: place.properties.opening_hours ? new Date() : new Date(),
//       closingTime: place.properties.opening_hours ? new Date() : new Date(),
//       isPopular: false,
//       category: place.properties.categories?.[0] || "غير معروف",
//       position: {
//         lat: place.properties.lat,
//         lng: place.properties.lon,
//       },
//       distance: place.properties.distance || "غير متوفر",
//     }));

//     res.status(200).json({
//       totalResults: results.length,
//       data: results,
//     });
//   } catch (error) {
//     console.error("Geoapify Error:", error.message);
//     res.status(500).json({ message: "فشل في جلب بيانات الأماكن الطبية" });
//   }
// });

// // 🔁 fetchAllPlaces function
// const fetchAllPlaces = async (baseUrl) => {
//   let offset = 0;
//   const limit = 100;
//   let allResults = [];
//   let hasMore = true;

//   while (hasMore) {
//     const pagedUrl = `${baseUrl}&limit=${limit}&offset=${offset}`;
//     const response = await axios.get(pagedUrl);
//     const features = response.data.features;

//     if (features.length === 0) {
//       hasMore = false;
//     } else {
//       allResults = allResults.concat(features);
//       offset += limit;
//     }

//     if (offset >= 500) break; // لمنع استهلاك الخطة المجانية
//   }

//   return allResults;
// };

exports.uploadImage = uploadSingleImage("images");

//Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const transformationOptions = {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      format: "auto",
      quality: "auto",
    };
    // upload file to cloadnairy
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Kemet/places", // specify cloudinary folder
      // resource_type : "video", // specify video resource type
      transformation: transformationOptions, // specify transformation options
    });

    req.body.images = result.secure_url;
    // Return the url of the uploaded file
    // return res.json({ url: result.secure_url });
  }
  next();
});

// Create place
exports.createPlace = HandlerFactory.createOne(Place);
// Get all places
exports.getPlaces = HandlerFactory.getAll(Place);

// Get single place
exports.getPlace = HandlerFactory.getOne(Place);

// Update place
exports.updatePlace = HandlerFactory.updateOne(Place);

// Delete place
exports.deletePlace = HandlerFactory.deleteOne(Place);

exports.insertManyPlaces = asyncHandler(async (req, res) => {
  const places = req.body;

  if (!Array.isArray(places) || places.length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide an array of places." });
  }

  const insertedPlaces = await Place.insertMany(places);
  res
    .status(201)
    .json({ message: "Places inserted successfully", data: insertedPlaces });
});
