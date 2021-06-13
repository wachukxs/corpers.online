`SELECT 
  "CorpMember"."PPAId", 
  "CorpMember"."id", 
  "CorpMember"."travel_from_city", 
  "CorpMember"."travel_from_state", 
  "CorpMember"."accommodation_location", 
  "CorpMember"."region_street", 
  "CorpMember"."city_town", 
  "CorpMember"."email", 
  "CorpMember"."lga", 
  "CorpMember"."stream", 
  "CorpMember"."servicestate", 
  "CorpMember"."batch", 
  "CorpMember"."statecode", 
  "CorpMember"."mediaId", 
  "CorpMember"."password", 
  "CorpMember"."middlename", 
  "CorpMember"."firstname", 
  "CorpMember"."lastname", 
  "CorpMember"."createdAt", 
  "CorpMember"."updatedAt", 
  "Sales"."id" AS "Sales.id", 
  "Sales"."statecode" AS "Sales.statecode", 
  "Sales"."itemname" AS "Sales.itemname", 
  "Sales"."price" AS "Sales.price", 
  "Sales"."text" AS "Sales.text", 
  "Sales"."mediaId" AS "Sales.mediaId", 
  "Sales"."createdAt" AS "Sales.createdAt", 
  "Sales"."updatedAt" AS "Sales.updatedAt", 
  "Accommodation"."id" AS "Accommodation.id", 
  "Accommodation"."mediaId" AS "Accommodation.mediaId", 
  "Accommodation"."directions" AS "Accommodation.directions", 
  "Accommodation"."rent" AS "Accommodation.rent", 
  "Accommodation"."statecode" AS "Accommodation.statecode", 
  "Accommodation"."createdAt" AS "Accommodation.createdAt", 
  "Accommodation"."updatedAt" AS "Accommodation.updatedAt" FROM "CorpMembers" AS "CorpMember" 
  INNER JOIN 
  "Sales" AS "Sales" ON "CorpMember"."statecode" = "Sales"."statecode" 
  AND 
  "Sales"."statecode" LIKE '%AB%' INNER JOIN "Accommodation" AS "Accommodation" 
  ON 
  "CorpMember"."statecode" = "Accommodation"."statecode" 
  AND 
  "Accommodation"."statecode" LIKE '%AB%' WHERE "CorpMember"."statecode" LIKE '%AB%';`