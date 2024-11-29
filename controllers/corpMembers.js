let express = require("express");
let router = express.Router();
const auth = require("../helpers/auth");
const corpMemberService = require("../services/corpMemberService");
const dataValidation = require("../middlewares/data-validation");

const PROFILE = "profile";

/* TODO: group related routes using same middleware? */

router.post(
  "/signup",
  express.json(),
  dataValidation.corpMemberSignUp,
  corpMemberService.create
);

// great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/
router.get(
  "/unread-messages",
  auth.verifyJWT,
  corpMemberService.unreadMessages
);

router.post(
  "/login",
  express.urlencoded({ extended: true }),
  express.json(),
  dataValidation.corpMemberLogin,
  corpMemberService.login
);

// why do we have this route? testing? would need to remote later
router.get("/all-users", corpMemberService.getAllUsers);

/* This route returns all the initial/default items we need to show in search. */
router.get("/all-items", corpMemberService.getAllItems);

router.get("/profile", auth.verifyJWT, corpMemberService.getProfile);

router.post(
  `/${PROFILE}`,
  auth.verifyJWT,
  express.json(),
  dataValidation.corpMemberProfileUpdate,
  corpMemberService.updateProfile
);
router.post(
  `/${PROFILE}/bio`,
  auth.verifyJWT,
  express.json(),
  corpMemberService.updateProfileBio
);
router.post(
  `/${PROFILE}/service-details`,
  auth.verifyJWT,
  express.json(),
  corpMemberService.updateProfileServiceDetails
);
router.post(
  `/${PROFILE}/ppa-details`,
  auth.verifyJWT,
  express.json(),
  corpMemberService.updateProfilePpaDetails
);
router.post(
  `/${PROFILE}/other-details`,
  auth.verifyJWT,
  express.json(),
  corpMemberService.updateProfileOtherDetails
);
router.post(
  `/${PROFILE}/profile-photo`,
  auth.verifyJWT,
  corpMemberService.updateProfilePhoto
);

router.post(
  "/save-push-subscription",
  auth.verifyJWT,
  express.json(),
  corpMemberService.savePushSubscription
);

router.post("/create-alert", auth.verifyJWT, corpMemberService.createAlert);

router.get(
  `/${PROFILE}/bookmarks`,
  auth.verifyJWT,
  corpMemberService.getAllBookmarkedItems
);
router.get(
  `/${PROFILE}/likes`,
  auth.verifyJWT,
  corpMemberService.getAllLikedItems
);
router.get(
  `/${PROFILE}/posts`,
  auth.verifyJWT,
  corpMemberService.getAllPostedItems
);

router.delete(
  `/${PROFILE}/post`,
  express.json(),
  auth.verifyJWT,
  dataValidation.deleteUserPostItem,
  corpMemberService.deletePostedItem
);

router.get("/posts", auth.verifyJWT, corpMemberService.getPosts);

/* 
  For searching all items,
  TODO: we don't need to check auth.
*/
router.post("/search", auth.checkJWT, express.json(), corpMemberService.searchPosts);

router.post(
  "/join-waitlist",
  express.json(),
  dataValidation.joinWaitListDataValidation,
  corpMemberService.joinWaitList
);

router.get("/hi", corpMemberService.hi);

module.exports = router;
