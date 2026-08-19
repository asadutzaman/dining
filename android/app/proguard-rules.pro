# Retrofit interfaces are referenced reflectively.
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keepattributes Signature,RuntimeVisibleAnnotations,AnnotationDefault

# kotlinx.serialization keeps generated serializers off the shrinker.
-keepclassmembers class ** {
    *** Companion;
}
-keepclasseswithmembers class ** {
    kotlinx.serialization.KSerializer serializer(...);
}
