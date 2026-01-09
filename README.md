# Case Study

Merhabalar,

Bu kısımda bu case study'den ve nasıl yaptığımdan bahsetmek istedim. Teknik detayları aşağıda bulabilirsiniz.
Hafta içi pek zaman ayıramayacağımı düşündüğüm için kendi proddaki kodlarımı ayıklayıp, gerekli yerleri çevirip bu projeyi oluşturdum.

Auth: MÖRÇ isimli bir webapp'ten geliyor. Social login bu projede de var ancak farklı gmail olduğu için aktif değil. Tek login yolu Google olmadığı için de bypass edilebiliyor.
Auth 2: galeri.calenius.io isimli multi tenant bir appten geliyor.
Notification: calenius.io isimli app'ten geliyor. Bu app, KOBİ'lerin asistanı gibi bir rol oynadığı için randevu, stok, muhasebe gibi parçaları var, dolayısıyla renklerle önem sıralaması mevcut. Olduğu gibi buraya da taşımak istedim.

## Not
Yukarıdaki özellikleri bu projeye entegre edebilmek için Claude kullandım. Zamanım kısıtlı olduğu için, bu zamanı kod yazmaya harcamaktansa prod-ready, scalable bir mimari yapabileceğimi göstermek daha mantıklı geldi. Bahsettiğim uygulamalardaki kısımları kendim yazmış olsam da bu projedekileri ben yazmadım. Database şemasını, projenin mimarisini drawdb ve excalidraw sitelerinde tasarladım, sonra da Claude'a bu tasarımları ve kodları referans vererek bu projeyi oluşturmasını istedim. Dosya yapısı, klasör isimleri, variable isimlerini de kendi kullandığım gibi değil de yazılı olmayan global isimlendirme kurallarına uygun olarak güncelledim. 
Kendi emekleriyle bu case study'yi hazırlayan diğer adayların hakkını yememek için bunu ayrıca belirtmek isterim.
Ayrıca, eğer zaman ayırabilirseniz bahsi geçen uygulamaları size tanıtmayı çok isterim.


## Architecture

Backend: Nest + TypeScript + Prisma + Firebase
Mobile: React Native (Expo) + TypeScript + Firebase Auth + FCM
State Management: Zustand
Validation: Zod (Mobile) + class-validator (Backend)
