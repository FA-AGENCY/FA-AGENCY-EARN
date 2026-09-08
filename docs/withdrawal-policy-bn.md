# উত্তোলন নীতি

উত্তোলনের জন্য server-side available balance, ন্যূনতম সীমা, account status, payment তথ্য এবং fraud review প্রযোজ্য।

অনুরোধের lifecycle হলো: PENDING → UNDER_REVIEW → APPROVED → PROCESSING → PAID। প্রয়োজনে PENDING বা UNDER_REVIEW অবস্থা থেকে REJECTED করা যেতে পারে।

প্রত্যাখ্যান হলে সংরক্ষিত অর্থ reversal ledger transaction-এর মাধ্যমে ফেরত দেওয়া হয়। PAID অবস্থা অনুমোদিত admin বা authorized payment process ছাড়া দেওয়া হয় না।

Payment তথ্য admin review-তে সীমিতভাবে masked থাকে। ভুল বা অসম্পূর্ণ তথ্য, অতিরিক্ত ঝুঁকি বা account restriction থাকলে processing বিলম্বিত বা প্রত্যাখ্যাত হতে পারে।
