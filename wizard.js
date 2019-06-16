const Telegraf = require('telegraf')
const path = require('path')
const WizardScene = require('telegraf/scenes/wizard')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra') 
const data = require('./data')
const bot = new Telegraf(data.token)
const TelegrafI18n = require('telegraf-i18n')


const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, 
  directory: path.resolve(__dirname, 'locales')
})


const superWizard = new WizardScene('super-wizard',

  ({ wizard, i18n, replyWithHTML }) => {
    replyWithHTML(
      i18n.t('getName'),
      Extra
        .markup(Markup.removeKeyboard(true))
    )
    return wizard.next()
  },

  ({ wizard, session, message, chat, i18n, replyWithHTML }) => {
    if (+chat.id < 0) {
      return
    }

    if (!message.text) {
      return replyWithHTML(i18n.t('getName'))
    }

    replyWithHTML(
      i18n.t('getNumber'),
      Extra
        .markup(Markup.keyboard([
          [Markup.contactRequestButton(i18n.t('buttons.sendNumber'))]
        ]).resize().oneTime())
    )

    session.name = message.text
    return wizard.next()
  },

  ({ wizard, session, message, i18n, replyWithHTML }) => {
    if (!message.text && !message.contact) {
      return replyWithHTML(i18n.t('getNumber'))
    }

    replyWithHTML(
      i18n.t('getLocation'),
      Extra
        .markup(Markup.keyboard([
          [Markup.locationRequestButton('buttons.sendLocation')]
        ]).resize().oneTime())
    )

    session.number = String(message.text || message.contact.phone_number)
    return wizard.next()
  },

  async ({ scene, session, message, i18n, replyWithHTML }) => {
    if (!message.location) {
      return replyWithHTML(
        i18n.t('getLocation'),
        Extra
          .markup(Markup.keyboard([
            [Markup.locationRequestButton('buttons.sendLocation')]
          ]).resize().oneTime())
      )
    }

    replyWithHTML(
      i18n.t('thanks'),
      Extra
        .markup(Markup.removeKeyboard(true))
      )

    bot.telegram.sendMessage(
      data.chatId, 
      makeText(i18n.t('newUser'), session),
      Extra
        .markup(Markup.inlineKeyboard([
          [Markup.callbackButton(i18n.t('getLocation'), `loc_${message.location.latitude}_${message.location.longitude}`)]
        ]))  
    )

    scene.leave('super-wizard')
  }
)

function makeText (text, session) {
  return text.replace('%name%', session.name).replace('%number%', session.number)
}

module.exports = superWizard