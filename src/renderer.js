const fs = require("fs");
const path = require("path");
var sionData = JSON.parse(fs.readFileSync(path.join(__dirname, "assets/Sion.json"), 'utf8'));
function chngimg() {
    var img = document.getElementById('Toggle');
    var index = img.value;
    if (index == 0 || typeof index == "undefined") {
        document.getElementById('Toggle').src  = path.join(__dirname, 'assets/Minion.svg');
        img.value = 1;
    }
     else if (index == 1){
       document.getElementById('Toggle').src = path.join(__dirname, 'assets/Jungle.svg');
        img.value = 2;
   }
    else {
        document.getElementById('Toggle').src = path.join(__dirname, 'assets/Champion.svg');
        img.value = 0;
    }

}
function recalculate() {
  document.getElementById('Qdamage').value = calculateQDamage(document.getElementById('Level').value, document.getElementById('QLevel').value, document.getElementById('QCharge').value, document.getElementById('bonusAD').value, document.getElementById('armorReduction').value, document.getElementById('percentArmorReduction').value, document.getElementById('percentArmorPen').value, document.getElementById('lethality').value, document.getElementById('enemyArmor').value, document.getElementById('enemyBonusArmor').value);
}
function calculateADGrowth(Level, TotalAD){
  console.log(TotalAD)
  if (Level == 1){
    return TotalAD
  }
  return calculateADGrowth(Level - 1, TotalAD + parseFloat(sionData.stats.attackdamageperlevel) * (0.65 + 0.035 * Level));
}

function calculateQDamage(Level, Qlevel, ChargeTime, bonusAD, ArmorReduction, PercentArmorReduction, PercentArmorPen, Lethality, Armor, BonusArmor) {
  ChargeTime = parseFloat(ChargeTime) * 4;
  bonusAD = parseInt(bonusAD);
  if (typeof document.getElementById('Toggle').value == "undefined"){
    document.getElementById('Toggle').value = 0;
  }
  //Damage Multiplier for champions, minions, and Jungle camps
  const DamageMultiplier = [1.0,0.6,1.5];
  const totalAD = parseFloat(calculateADGrowth(parseInt(Level), sionData.stats.attackdamage + bonusAD));
  const QMinBase = sionData.spells[0].effectAmounts.Effect1Amount[Qlevel]
  const QMinRatio = parseFloat(sionData.spells[0].effectAmounts.Effect3Amount[Qlevel])
  const QMaxBase = sionData.spells[0].effectAmounts.Effect4Amount[Qlevel]
  const QMaxRatio = parseFloat(sionData.spells[0].effectAmounts.Effect6Amount[Qlevel])
  const QBaseIncrement = (QMaxBase - QMinBase)/8
  const QRatioIncrement = (QMaxRatio - QMinRatio)/8.0
  const QRatio = QMinRatio + QRatioIncrement * ChargeTime;
  const RatioDamage = totalAD * QRatio;
  const BaseDamage = QMinBase + QBaseIncrement * ChargeTime;
  var ADmultiplier = calculateADMultiplier(Level, ArmorReduction, PercentArmorReduction, PercentArmorPen, Lethality, Armor, BonusArmor);
  return Math.round((ADmultiplier * (BaseDamage + RatioDamage) * DamageMultiplier[document.getElementById('Toggle').value])) ;
}
function calculateADMultiplier(Level, ArmorReduction, PercentArmorReduction, PercentArmorPen, Lethality, Armor, BonusArmor){
  Armor = parseFloat(Armor);
  BonusArmor = parseFloat(BonusArmor);
  //Lethality Calculations
  const ArmorPen = parseInt(Lethality) * (0.6 + 0.4 * parseInt(Level)/18);
  var TotalArmor = Armor + BonusArmor;
  //Armor calcutions
  //Flat Armor Reduction
  TotalArmor = TotalArmor - parseInt(ArmorReduction);
  //If reduced more than Base armor. Note, this is only time armor can reach a negative value.
  if (TotalArmor < 0) {
    return 2 - 100/(100-TotalArmor);
  }
  else{
    //If reduced more than bonus armor
    if (TotalArmor <= Armor) {
      BonusArmor = 0;
      BaseArmor = TotalArmor;
    }
    else {
      BonusArmor = TotalArmor - Armor;
    }
    //Percent Armor Reduction
    TotalArmor = TotalArmor - TotalArmor * parseInt(PercentArmorReduction)/100;
    //If reduced more than bonus armor
    if (TotalArmor <= Armor) {
      BonusArmor = 0;
      BaseArmor = TotalArmor;
    }
    else{
      BonusArmor = (TotalArmor - Armor);
      //Percent Armor Penetration (doesn't apply to base armor)
      BonusArmor = BonusArmor - parseInt(PercentArmorPen) * BonusArmor;
      TotalArmor = BonusArmor + Armor;
    }
    //Lethality
    TotalArmor = TotalArmor - ArmorPen;
    if (TotalArmor < 0){
      TotalArmor = 0
    }
    return 100/(100 + TotalArmor);
  }
}